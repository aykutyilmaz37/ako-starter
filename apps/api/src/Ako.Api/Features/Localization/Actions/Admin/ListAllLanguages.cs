using Microsoft.AspNetCore.Http.HttpResults;

namespace Ako.Api.Features.Localization;

// GET /admin/localization/languages → kapalılar dahil tüm diller (varsayılan önce).

#region İş mantığı

public sealed class ListAllLanguagesHandler(TranslationCatalog catalog)
{
    public IReadOnlyList<LanguageResponse> Handle() => catalog.Languages.Select(LanguageResponse.From).ToList();
}

#endregion

#region Endpoint

internal static class ListAllLanguages
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/languages", Handle).WithName("AdminListLanguages");

    private static Ok<IReadOnlyList<LanguageResponse>> Handle(ListAllLanguagesHandler handler) =>
        TypedResults.Ok(handler.Handle());
}

#endregion
