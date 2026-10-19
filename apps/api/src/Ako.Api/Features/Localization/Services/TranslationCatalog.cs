using System.Collections;
using System.Collections.Concurrent;
using System.Collections.Frozen;
using System.Globalization;
using System.Resources;
using System.Security.Cryptography;
using System.Text.Json;
using Ako.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Localization;

/// <summary>Bir dilin bir ad alanındaki tüm metinleri; Json ve ETag web'e gönderilen yanıt için hazır tutulur.</summary>
public sealed record LocalizedDictionary(FrozenDictionary<string, string> Values, byte[] Json, string ETag);

/// <summary>Bir dilin özeti (dil seçici ve istek dili doğrulaması için).</summary>
public sealed record LanguageInfo(string Code, string Name, bool IsDefault, bool IsEnabled);

/// <summary>
/// Tüm çevirilerin tek arama noktası. İki katman:
///   1) Varsayılan metinler — dosyalardan, uygulama açılırken bir kez okunur:
///        api        → Resources/Localization/Messages*.resx (gömülü kaynak)
///        site, backoffice → web uygulamalarının app/locales/*.json dosyaları (derlemede API'ye gömülür)
///   2) Ezmeler — Translation tablosu; bellekte tutulur, admin değiştirince anında, diğer API kopyalarında en geç
///      TranslationRefresher aralığında yenilenir.
/// Arama sırası: istenen dilin ezmesi → istenen dilin dosyası → (bölgeli dilse ana dil) → varsayılan dil.
/// </summary>
public sealed class TranslationCatalog
{
    private readonly FrozenDictionary<string, FrozenDictionary<string, FrozenDictionary<string, string>>> _defaults;
    private volatile Snapshot _snapshot = Snapshot.Empty;

    private sealed record Snapshot(
        FrozenDictionary<(string Culture, string Namespace), FrozenDictionary<string, string>> Overrides,
        IReadOnlyList<LanguageInfo> Languages,
        long Version)
    {
        // Bu sürüm için hesaplanmış sonuçlar; yeni sürümde (yenilemede) baştan boş başlar.
        public ConcurrentDictionary<(string Namespace, string Culture), LocalizedDictionary> Dictionaries { get; } = new();
        public ConcurrentDictionary<string, string[]> Keys { get; } = new();

        public static readonly Snapshot Empty = new(
            FrozenDictionary<(string, string), FrozenDictionary<string, string>>.Empty,
            [new LanguageInfo(DefaultCultureFallback, "Türkçe", true, true)],
            0);
    }

    /// <summary>Veritabanı okunamadan önce (ör. build sırasında) kullanılan varsayılan dil.</summary>
    public const string DefaultCultureFallback = "tr";

    private static readonly JsonSerializerOptions JsonOptions = new() { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    public TranslationCatalog() => _defaults = LoadDefaults();

    public IReadOnlyList<LanguageInfo> Languages => _snapshot.Languages;
    public string DefaultCulture => _snapshot.Languages.FirstOrDefault(l => l.IsDefault)?.Code ?? DefaultCultureFallback;

    /// <summary>Önbellek doğrulaması için: her yenilemede artar (sözlük yanıtlarının ETag'i).</summary>
    public long Version => _snapshot.Version;

    public bool IsEnabled(string culture) => _snapshot.Languages.Any(l => l.IsEnabled && l.Code.Equals(culture, StringComparison.OrdinalIgnoreCase));

    /// <summary>Bir metni bulur; hiçbir yerde yoksa null.</summary>
    public string? Find(string @namespace, string culture, string key)
    {
        foreach (var candidate in Fallbacks(culture))
        {
            if (_snapshot.Overrides.TryGetValue((candidate, @namespace), out var overrides) && overrides.TryGetValue(key, out var value))
                return value;
            if (DefaultsFor(@namespace, candidate)?.TryGetValue(key, out value) == true)
                return value;
        }
        return null;
    }

    /// <summary>
    /// Bir ad alanının tüm metinleri, istenen dilde (eksikler varsayılan dilden). Web arayüzü bunu alır.
    /// Sonuç katalog sürümüne göre önbelleklenir: aynı sürüm için yalnızca bir kez kurulur ve JSON'a çevrilir.
    /// </summary>
    public LocalizedDictionary Dictionary(string @namespace, string culture)
    {
        var snapshot = _snapshot;
        return snapshot.Dictionaries.GetOrAdd((@namespace, culture), _ =>
        {
            var values = Keys(@namespace).ToFrozenDictionary(key => key, key => Find(@namespace, culture, key) ?? key);
            var json = JsonSerializer.SerializeToUtf8Bytes(values.ToDictionary(), JsonOptions);
            var etag = $"\"{Convert.ToHexStringLower(SHA256.HashData(json).AsSpan(0, 8))}\"";
            return new LocalizedDictionary(values, json, etag);
        });
    }

    /// <summary>Bir ad alanında bilinen tüm anahtarlar (dosyalardan + ezmelerden), sıralı. Sürüm başına bir kez hesaplanır.</summary>
    public IReadOnlyList<string> Keys(string @namespace)
    {
        var snapshot = _snapshot;
        return snapshot.Keys.GetOrAdd(@namespace, ns =>
        {
            var keys = new SortedSet<string>(StringComparer.Ordinal);
            if (_defaults.TryGetValue(ns, out var cultures))
                foreach (var dictionary in cultures.Values) keys.UnionWith(dictionary.Keys);
            foreach (var ((_, overrideNs), overrides) in snapshot.Overrides)
                if (overrideNs == ns) keys.UnionWith(overrides.Keys);
            return [.. keys];
        });
    }

    /// <summary>Dosyadaki (varsayılan) değer; ezme dikkate alınmaz.</summary>
    public string? FileValue(string @namespace, string culture, string key) =>
        DefaultsFor(@namespace, culture)?.GetValueOrDefault(key);

    public string? OverrideValue(string @namespace, string culture, string key) =>
        _snapshot.Overrides.TryGetValue((culture, @namespace), out var o) ? o.GetValueOrDefault(key) : null;

    /// <summary>Ezmeleri ve dilleri veritabanından yeniden okur.</summary>
    public async Task RefreshAsync(AppDbContext db, CancellationToken ct)
    {
        var languages = await db.Languages.AsNoTracking()
            .OrderByDescending(l => l.IsDefault).ThenBy(l => l.Code)
            .Select(l => new LanguageInfo(l.Code, l.Name, l.IsDefault, l.IsEnabled))
            .ToListAsync(ct);
        var rows = await db.Translations.AsNoTracking().Select(t => new { t.Culture, t.Namespace, t.Key, t.Value }).ToListAsync(ct);

        var overrides = rows
            .GroupBy(r => (r.Culture, r.Namespace))
            .ToFrozenDictionary(g => g.Key, g => g.ToFrozenDictionary(r => r.Key, r => r.Value));

        _snapshot = new Snapshot(overrides, languages.Count > 0 ? languages : Snapshot.Empty.Languages, _snapshot.Version + 1);
    }

    private IEnumerable<string> Fallbacks(string culture)
    {
        yield return culture;
        var dash = culture.IndexOf('-');
        if (dash > 0) yield return culture[..dash]; // "pt-BR" → "pt"
        if (!culture.Equals(DefaultCulture, StringComparison.OrdinalIgnoreCase)) yield return DefaultCulture;
    }

    private FrozenDictionary<string, string>? DefaultsFor(string @namespace, string culture) =>
        _defaults.TryGetValue(@namespace, out var cultures) && cultures.TryGetValue(culture, out var dictionary) ? dictionary : null;

    // --- varsayılan metinlerin dosyalardan okunması ---

    private static FrozenDictionary<string, FrozenDictionary<string, FrozenDictionary<string, string>>> LoadDefaults()
    {
        var assembly = typeof(TranslationCatalog).Assembly;
        var result = new Dictionary<string, FrozenDictionary<string, FrozenDictionary<string, string>>>
        {
            [TranslationNamespaces.Api] = LoadResx(),
        };

        // Gömülü web dosyaları: "Locales/<ad alanı>/<dil>.json"
        foreach (var group in assembly.GetManifestResourceNames()
                     .Where(n => n.StartsWith("Locales/", StringComparison.Ordinal) && n.EndsWith(".json", StringComparison.Ordinal))
                     .GroupBy(n => n.Split('/')[1]))
        {
            result[group.Key] = group.ToFrozenDictionary(
                name => Path.GetFileNameWithoutExtension(name),
                name =>
                {
                    using var stream = assembly.GetManifestResourceStream(name)!;
                    return JsonSerializer.Deserialize<Dictionary<string, string>>(stream)!.ToFrozenDictionary();
                });
        }

        return result.ToFrozenDictionary();
    }

    private static FrozenDictionary<string, FrozenDictionary<string, string>> LoadResx()
    {
        var manager = new ResourceManager("Ako.Api.Resources.Localization.Messages", typeof(TranslationCatalog).Assembly);
        var cultures = new Dictionary<string, FrozenDictionary<string, string>>();

        // Ana dosya (Messages.resx) varsayılan dildir; uydu dosyalar (Messages.en.resx…) kendi dillerinde.
        foreach (var culture in CultureInfo.GetCultures(CultureTypes.NeutralCultures).Prepend(CultureInfo.InvariantCulture))
        {
            var set = manager.GetResourceSet(culture, createIfNotExists: true, tryParents: false);
            if (set is null) continue;
            var code = culture.Equals(CultureInfo.InvariantCulture) ? DefaultCultureFallback : culture.Name;
            cultures[code] = set.Cast<DictionaryEntry>().ToFrozenDictionary(e => (string)e.Key, e => (string)e.Value!);
        }

        return cultures.ToFrozenDictionary();
    }
}
