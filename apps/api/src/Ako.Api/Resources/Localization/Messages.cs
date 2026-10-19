using System.Globalization;
using System.Resources;
using Ako.Api.Features.Localization; // ako:lang

// Messages.resx Türkçedir; dil eşleşmediğinde buna düşülür.
[assembly: NeutralResourcesLanguage("tr")]

namespace Ako.Api.Resources.Localization;

/// <summary>
/// API mesajlarına (hatalar, doğrulama, e-postalar) erişim. Dil, RequestLocalization middleware'inin Accept-Language'e
/// göre ayarladığı CultureInfo.CurrentUICulture'dan gelir. Metin önce çeviri kataloğundan (tablodaki ezmeler +
/// resx), katalog yoksa (ör. build sırasında) doğrudan resx'ten okunur.
/// Statik olması bilinçli: validator'lar, FluentValidation'ın global ayarları ve ProblemDetails özelleştirmesi DI'a
/// bağlı kalmadan aynı yerden okur.
/// </summary>
public static class Messages
{
    private static readonly ResourceManager Resources = new("Ako.Api.Resources.Localization.Messages", typeof(Messages).Assembly);

    // ako:begin lang
    /// <summary>Uygulama açılırken ayarlanır (bkz. LocalizationExtensions).</summary>
    public static TranslationCatalog? Catalog { get; set; }
    // ako:end lang

    /// <summary>Anahtarın çevirisini döner; yoksa anahtarın kendisini (eksik çeviri görünür kalsın diye).</summary>
    public static string Get(string key, params object?[] args)
    {
        var format = Find(key) ?? key;
        return args.Length == 0 ? format : string.Format(CultureInfo.CurrentCulture, format, args);
    }

    // ako:begin lang
    public static string? Find(string key) =>
        Catalog?.Find(TranslationNamespaces.Api, CultureInfo.CurrentUICulture.Name, key)
        ?? Resources.GetString(key, CultureInfo.CurrentUICulture);
    // ako:else lang
    //~ public static string? Find(string key) => Resources.GetString(key, CultureInfo.CurrentUICulture);
    // ako:end lang
}
