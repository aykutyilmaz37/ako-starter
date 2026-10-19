using Ako.Api.Common;

namespace Ako.Api.Features.Localization;

/// <summary>
/// Bir metnin belirli bir dildeki ezmesi. Varsayılan metinler dosyalarda (api: resx, site/backoffice: JSON);
/// bu tablo yalnızca değiştirilen ya da yeni bir dil için girilen metinleri tutar.
/// </summary>
public sealed class Translation : IEntity, IAuditable
{
    public const int KeyMaxLength = 200;
    public const int ValueMaxLength = 4000;

    private Translation() { } // EF Core

    public Guid Id { get; private set; }
    public string Culture { get; private set; } = null!;

    /// <summary>Metnin ait olduğu yer: "api", "site", "backoffice" (bkz. TranslationNamespaces).</summary>
    public string Namespace { get; private set; } = null!;

    public string Key { get; private set; } = null!;
    public string Value { get; private set; } = null!;

    public DateTimeOffset CreatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public Guid? UpdatedBy { get; private set; }

    public static Translation Create(string culture, string @namespace, string key, string value) =>
        new() { Id = Guid.CreateVersion7(), Culture = culture, Namespace = @namespace, Key = key, Value = value };

    public void Update(string value) => Value = value;
}
