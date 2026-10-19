namespace Ako.Api.Features.Localization;

/// <summary>Çeviri tablosunda bir satır: bir anahtar ve her dildeki değeri.</summary>
/// <param name="Values">Dil koduna göre hücreler; tüm diller (kapalılar dahil) bulunur.</param>
public sealed record TranslationEntryResponse(string Key, IReadOnlyDictionary<string, TranslationCellResponse> Values)
{
    public static TranslationEntryResponse From(TranslationCatalog catalog, string @namespace, string key) =>
        new(key, catalog.Languages.ToDictionary(l => l.Code, l =>
        {
            var fileValue = catalog.FileValue(@namespace, l.Code, key);
            var overrideValue = catalog.OverrideValue(@namespace, l.Code, key);
            return new TranslationCellResponse(overrideValue ?? fileValue, fileValue, overrideValue is not null);
        }));
}

/// <summary>Bir anahtarın bir dildeki durumu.</summary>
/// <param name="Value">Geçerli değer: ezme varsa o, yoksa dosyadaki. İkisi de yoksa null (eksik çeviri).</param>
/// <param name="FileValue">Dosyadaki (resx/JSON) değer; ezme silinince bu geçerli olur.</param>
/// <param name="IsOverridden">Değer tablodan mı geliyor.</param>
public sealed record TranslationCellResponse(string? Value, string? FileValue, bool IsOverridden);
