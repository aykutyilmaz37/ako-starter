using Ako.Api.Common;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Ako.Api.Features.Localization;

// GET /admin/localization/translations?namespace=site&search=sepet&onlyMissing=true&page=1
// → sayfalı çeviri tablosu: her satır bir anahtar, her sütun bir dil.

#region İstek

/// <param name="Namespace">"api", "site" ya da "backoffice".</param>
/// <param name="Search">Anahtarda ve tüm dillerdeki değerlerde arar.</param>
/// <param name="OnlyMissing">Yalnızca en az bir açık dilde karşılığı olmayan anahtarlar.</param>
public sealed record ListTranslationsQuery(
    string Namespace, string? Search = null, bool OnlyMissing = false, int Page = 1, int PageSize = Paging.DefaultPageSize);

#endregion

#region Doğrulama

internal sealed class ListTranslationsQueryValidator : AbstractValidator<ListTranslationsQuery>
{
    public ListTranslationsQueryValidator()
    {
        RuleFor(x => x.Namespace).NotEmpty().Must(ns => TranslationNamespaces.All.Contains(ns));
        RuleFor(x => x.Search).MaximumLength(100);
        RuleFor(x => x.Page).ValidPage();
        RuleFor(x => x.PageSize).ValidPageSize();
    }
}

#endregion

#region İş mantığı — bellekteki katalogdan; birkaç bin anahtar için veritabanı sorgusundan hızlı

public sealed class ListTranslationsHandler(TranslationCatalog catalog)
{
    public PagedResponse<TranslationEntryResponse> Handle(ListTranslationsQuery query)
    {
        var entries = catalog.Keys(query.Namespace)
            .Select(key => TranslationEntryResponse.From(catalog, query.Namespace, key));

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            entries = entries.Where(e =>
                e.Key.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                e.Values.Values.Any(v => v.Value?.Contains(search, StringComparison.CurrentCultureIgnoreCase) == true));
        }

        if (query.OnlyMissing)
        {
            var enabled = catalog.Languages.Where(l => l.IsEnabled).Select(l => l.Code).ToList();
            entries = entries.Where(e => enabled.Any(code => e.Values[code].Value is null));
        }

        var all = entries.ToList();
        var page = all.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToList();
        return new PagedResponse<TranslationEntryResponse>(page, query.Page, query.PageSize, all.Count);
    }
}

#endregion

#region Endpoint

internal static class ListTranslations
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/translations", Handle).WithName("AdminListTranslations").WithValidation<ListTranslationsQuery>();

    private static Ok<PagedResponse<TranslationEntryResponse>> Handle(
        [AsParameters] ListTranslationsQuery query, ListTranslationsHandler handler) =>
        TypedResults.Ok(handler.Handle(query));
}

#endregion
