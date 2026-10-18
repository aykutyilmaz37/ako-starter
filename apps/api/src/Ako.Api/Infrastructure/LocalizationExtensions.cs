using Ako.Api.Common;
using Ako.Api.Resources;
using FluentValidation;
using Microsoft.AspNetCore.Localization;

namespace Ako.Api.Infrastructure;

public static class LocalizationExtensions
{
    public static readonly string[] SupportedCultures = ["tr", "en"];
    public const string DefaultCulture = "tr";

    /// <summary>
    /// Dil yalnızca Accept-Language başlığından seçilir (web BFF ve mobil bu başlığı gönderir).
    /// FluentValidation'ın yerleşik mesajları (tr/en) CurrentUICulture'ı izler; alan adları
    /// resx'teki "field.&lt;camelCase&gt;" anahtarlarından gelir, yoksa FluentValidation varsayılanı kullanılır.
    /// </summary>
    public static IServiceCollection AddAppLocalization(this IServiceCollection services)
    {
        services.AddRequestLocalization(options =>
        {
            options.SetDefaultCulture(DefaultCulture)
                .AddSupportedCultures(SupportedCultures)
                .AddSupportedUICultures(SupportedCultures);
            options.RequestCultureProviders = [new AcceptLanguageHeaderRequestCultureProvider()];
        });

        ValidatorOptions.Global.DisplayNameResolver = (_, member, _) =>
            member is null ? null : Messages.Find($"field.{char.ToLowerInvariant(member.Name[0])}{member.Name[1..]}");

        services.AddProblemDetails(options => options.CustomizeProblemDetails = ProblemDetailsLocalization.Apply);

        return services;
    }
}
