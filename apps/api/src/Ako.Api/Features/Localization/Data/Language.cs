using Ako.Api.Common;

namespace Ako.Api.Features.Localization;

/// <summary>
/// Uygulamanın desteklediği bir dil. Varsayılan dil (tr) her metnin mutlaka bulunduğu dildir; diğer dillerde eksik
/// metin varsayılana düşer. Admin backoffice'ten yeni dil ekleyebilir; çevirileri tablodan girilir.
/// </summary>
public sealed class Language : IEntity
{
    public const int CodeMaxLength = 10;
    public const int NameMaxLength = 50;

    private Language() { } // EF Core

    /// <summary>BCP 47 kodu: "tr", "en", "de", "pt-BR"…</summary>
    public string Code { get; private set; } = null!;

    /// <summary>Dilin kendi dilindeki adı ("Türkçe", "English", "Deutsch"); dil seçicide gösterilir.</summary>
    public string Name { get; private set; } = null!;

    public bool IsDefault { get; private set; }
    public bool IsEnabled { get; private set; }

    public static Language Create(string code, string name, bool isDefault = false) =>
        new() { Code = code.Trim(), Name = name.Trim(), IsDefault = isDefault, IsEnabled = true };

    public void Update(string name, bool isEnabled)
    {
        Name = name.Trim();
        IsEnabled = IsDefault || isEnabled; // varsayılan dil kapatılamaz
    }
}
