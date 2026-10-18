using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Products;

// GET /products/{id} → tek ürün, yoksa 404

#region İş mantığı

public sealed class GetProductHandler(AppDbContext db)
{
    /// <summary>Ürünü id ile bulur; yoksa "products.not_found" hatası döner.</summary>
    public async Task<Result<ProductResponse>> HandleAsync(Guid id, CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);
        return product is null ? ProductErrors.NotFound(id) : ProductResponse.From(product);
    }
}

#endregion

#region Endpoint

internal static class GetProduct
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/{id:guid}", Handle).WithName("GetProduct").ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<ProductResponse>, ProblemHttpResult>> Handle(
        Guid id, GetProductHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(id, ct);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
