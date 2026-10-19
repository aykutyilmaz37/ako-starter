using Microsoft.AspNetCore.Http.HttpResults;

namespace Ako.Api.Features.Localization;

// GET /localization/languages → açık diller (varsayılan önce). Web dil seçicisi ve adresteki dil doğrulaması kullanır.

#region İş mantığı — bellekteki katalogdan okur, veritabanına gitmez

public sealed class GetLanguagesHandler(TranslationCatalog catalog)
{
    public IReadOnlyList<LanguageResponse> Handle() =>
        catalog.Languages.Where(l => l.IsEnabled).Select(LanguageResponse.From).ToList();
}

#endregion

#region Endpoint

internal static class GetLanguages
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/languages", Handle).WithName("GetLanguages");

    private static Ok<IReadOnlyList<LanguageResponse>> Handle(GetLanguagesHandler handler, HttpContext http)
    {
        http.Response.Headers.CacheControl = "public, max-age=60";
        return TypedResults.Ok(handler.Handle());
    }
}

#endregion
