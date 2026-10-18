using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Products;

// DELETE /products/{id} → 204 (gövdesiz). Yoksa 404. Yalnızca Admin.

#region İş mantığı

public sealed class DeleteProductHandler(AppDbContext db)
{
    /// <summary>Ürünü tek sorguyla siler (önce okumadan); silinecek kayıt yoksa "products.not_found".</summary>
    public async Task<Result> HandleAsync(Guid id, CancellationToken ct)
    {
        var deleted = await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync(ct);
        return deleted == 0 ? ProductErrors.NotFound(id) : Result.Success();
    }
}

#endregion

#region Endpoint

internal static class DeleteProduct
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapDelete("/{id:guid}", Handle).WithName("DeleteProduct")
            .RequireAuthorization(AppPolicies.Admin)
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<NoContent, ProblemHttpResult>> Handle(
        Guid id, DeleteProductHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(id, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}

#endregion
