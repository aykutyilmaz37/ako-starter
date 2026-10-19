using Ako.Api.Common;

namespace Ako.Api.Features.Localization;

// GET /localization/{culture}/{namespace} → { "anahtar": "metin", ... }
// Bir arayüzün (site, backoffice) tüm metinleri tek dilde; eksikler varsayılan dilden doldurulur.
// Yanıt bellekte hazır JSON'dır (sürüm başına bir kez kurulur) ve ETag taşır: istemci If-None-Match gönderirse
// metinler değişmediyse gövdesiz 304 döner.

#region İş mantığı

public sealed class GetDictionaryHandler(TranslationCatalog catalog)
{
    public Result<LocalizedDictionary> Handle(string culture, string @namespace)
    {
        if (!TranslationNamespaces.All.Contains(@namespace))
        {
            return LocalizationErrors.NamespaceNotFound(@namespace);
        }

        if (!catalog.IsEnabled(culture))
        {
            return LocalizationErrors.LanguageNotFound(culture);
        }

        return catalog.Dictionary(@namespace, culture);
    }
}

#endregion

#region Endpoint

internal static class GetDictionary
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{culture}/{namespace}", Handle).WithName("GetDictionary")
            .Produces<Dictionary<string, string>>()
            .Produces(StatusCodes.Status304NotModified)
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static IResult Handle(string culture, string @namespace, GetDictionaryHandler handler, HttpContext http)
    {
        var result = handler.Handle(culture, @namespace);
        if (!result.IsSuccess)
        {
            return result.Error.ToProblem();
        }

        var dictionary = result.Value;
        // Kısa süre önbellekte kalır; süre dolunca eskisi gösterilirken arkada yenilenebilir.
        http.Response.Headers.CacheControl = "public, max-age=60, stale-while-revalidate=600";
        http.Response.Headers.ETag = dictionary.ETag;

        return http.Request.Headers.IfNoneMatch == dictionary.ETag
            ? TypedResults.StatusCode(StatusCodes.Status304NotModified)
            : TypedResults.Bytes(dictionary.Json, "application/json");
    }
}

#endregion
