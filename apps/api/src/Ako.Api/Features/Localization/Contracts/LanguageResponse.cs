namespace Ako.Api.Features.Localization;

/// <param name="Code">BCP 47 kodu ("tr", "en", "pt-BR"); web adreste ve bayrak dosyasında (/flags/&lt;kod&gt;.png) kullanır.</param>
/// <param name="Name">Dilin kendi dilindeki adı ("Deutsch").</param>
public sealed record LanguageResponse(string Code, string Name, bool IsDefault, bool IsEnabled)
{
    public static LanguageResponse From(LanguageInfo language) =>
        new(language.Code, language.Name, language.IsDefault, language.IsEnabled);
}
