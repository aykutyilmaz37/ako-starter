namespace Ako.Api.Features.Localization;

// Çoklu dil — iki grup adres:
//   /localization        → herkese açık: diller ve arayüz sözlükleri (site ve backoffice kullanır)
//   /admin/localization  → çeviri tablosu, dil ekleme/kapatma, dosya olarak dışa aktarma
public static class LocalizationEndpoints
{
    public static IEndpointRouteBuilder MapLocalization(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/localization").WithTags("Localization");

        GetLanguages.Map(group);
        GetDictionary.Map(group);

        return app;
    }

    public static RouteGroupBuilder MapLocalizationAdmin(this RouteGroupBuilder admin)
    {
        var group = admin.MapGroup("/localization").WithTags("Admin: Localization");

        ListTranslations.Map(group);
        SetTranslation.Map(group);
        ListAllLanguages.Map(group);
        CreateLanguage.Map(group);
        UpdateLanguage.Map(group);
        ExportTranslations.Map(group);

        return admin;
    }
}
