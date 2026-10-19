namespace Ako.Api.Features.Localization;

/// <summary>Çevirilerin ait olduğu yerler. Her birinin varsayılan metinleri ayrı dosyalarda durur.</summary>
public static class TranslationNamespaces
{
    /// <summary>API mesajları: hatalar, doğrulama, e-postalar. Varsayılanlar Resources/Localization/Messages*.resx.</summary>
    public const string Api = "api";

    /// <summary>Site arayüzü. Varsayılanlar apps/web/site/app/locales/*.json (API'ye derlemede gömülür).</summary>
    public const string Site = "site";

    /// <summary>Backoffice arayüzü. Varsayılanlar apps/web/backoffice/app/locales/*.json.</summary>
    public const string Backoffice = "backoffice";

    public static readonly string[] All = [Api, Site, Backoffice];
}
