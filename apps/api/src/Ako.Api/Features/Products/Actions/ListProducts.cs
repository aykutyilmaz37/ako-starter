using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Products;

// GET /products?page=1&pageSize=20&search=etiyopya&category=Coffee → sayfalı ürün listesi

#region İstek — query string parametreleri

public sealed record ListProductsQuery(
    int Page = 1, int PageSize = Paging.DefaultPageSize, string? Search = null, ProductCategory? Category = null);

#endregion

#region Doğrulama — hatalı parametrede 400 döner, handler hiç çalışmaz

internal sealed class ListProductsQueryValidator : AbstractValidator<ListProductsQuery>
{
    public ListProductsQueryValidator()
    {
        RuleFor(x => x.Page).ValidPage();
        RuleFor(x => x.PageSize).ValidPageSize();
        RuleFor(x => x.Search).MaximumLength(100);
        RuleFor(x => x.Category).IsInEnum();
    }
}

#endregion

#region İş mantığı — veritabanından okur

public sealed class ListProductsHandler(AppDbContext db)
{
    /// <summary>Ada göre sıralı ürünleri döner; search ad ve SKU içinde arar (büyük/küçük harf duyarsız), category süzer.</summary>
    public Task<PagedResponse<ProductResponse>> HandleAsync(ListProductsQuery query, CancellationToken ct)
    {
        var products = db.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            products = products.Where(p => EF.Functions.ILike(p.Name, pattern) || EF.Functions.ILike(p.Sku, pattern));
        }

        if (query.Category is { } category)
        {
            products = products.Where(p => p.Category == category);
        }

        return products
            .OrderBy(p => p.Name)
            .ThenBy(p => p.Id)
            .Select(p => new ProductResponse(p.Id, p.Sku, p.Name, p.Description, p.Category, p.ImageUrl, p.Price, p.Stock, p.CreatedAt, p.UpdatedAt))
            .ToPagedAsync(query.Page, query.PageSize, ct);
    }
}

#endregion

#region Endpoint — HTTP isteğini handler'a bağlar

internal static class ListProducts
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/", Handle).WithName("ListProducts").WithValidation<ListProductsQuery>();

    private static async Task<Ok<PagedResponse<ProductResponse>>> Handle(
        [AsParameters] ListProductsQuery query, ListProductsHandler handler, CancellationToken ct) =>
        TypedResults.Ok(await handler.HandleAsync(query, ct));
}

#endregion
