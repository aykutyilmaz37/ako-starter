using Ako.Api.Common;
using Ako.Api.Features.Localization;
using Ako.Api.Resources.Localization;
using FluentValidation;
using Microsoft.AspNetCore.Localization;

namespace Ako.Api.Infrastructure;

public static class LocalizationExtensions
{
    /// <summary>
    /// Dil Accept-Language başlığından seçilir (web BFF ve mobil bu başlığı gönderir). Desteklenen diller Language
    /// tablosundan gelir ve TranslationRefresher ile güncel tutulur; burada yalnızca açılış değerleri var.
    /// Metinler TranslationCatalog'dan: tablodaki ezme → resx/JSON → varsayılan dil.
    /// FluentValidation'ın yerleşik mesajları CurrentUICulture'ı izler; alan adları "field.&lt;camelCase&gt;" anahtarlarından.
    /// </summary>
    public static IServiceCollection AddAppLocalization(this IServiceCollection services)
    {
        // Messages statik olduğundan katalog süreç başına tektir (testlerde aynı süreçte birden fazla uygulama örneği olabilir).
        var catalog = Messages.Catalog ??= new TranslationCatalog();
        services.AddSingleton(catalog);
        services.AddSingleton<TranslationRefresher>();
        services.AddHostedService(sp => sp.GetRequiredService<TranslationRefresher>());

        string[] startupCultures = ["tr", "en", "de"];
        services.AddRequestLocalization(options =>
        {
            options.SetDefaultCulture(TranslationCatalog.DefaultCultureFallback)
                .AddSupportedCultures(startupCultures)
                .AddSupportedUICultures(startupCultures);
            options.RequestCultureProviders = [new AcceptLanguageHeaderRequestCultureProvider()];
        });

        ValidatorOptions.Global.DisplayNameResolver = (_, member, _) =>
            member is null ? null : Messages.Find($"field.{char.ToLowerInvariant(member.Name[0])}{member.Name[1..]}");

        services.AddProblemDetails(options => options.CustomizeProblemDetails = ProblemDetailsLocalization.Apply);

        return services;
    }
}
