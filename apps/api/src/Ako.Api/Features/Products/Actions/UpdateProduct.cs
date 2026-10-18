using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Products;

// PUT /products/{id} → ürünü günceller, 200 + güncel ürün. Yoksa 404.

#region İstek — SKU yok, çünkü SKU değiştirilemez

public sealed record UpdateProductRequest(string Name, string? Description, decimal Price, int Stock);

#endregion

#region Doğrulama

internal sealed class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(Product.NameMaxLength);
        RuleFor(x => x.Description).MaximumLength(Product.DescriptionMaxLength);
        RuleFor(x => x.Price).GreaterThan(0).PrecisionScale(12, 2, ignoreTrailingZeros: true);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
    }
}

#endregion

#region İş mantığı

public sealed class UpdateProductHandler(AppDbContext db, TimeProvider time)
{
    /// <summary>Ürünü bulup alanlarını günceller; yoksa "products.not_found" hatası döner.</summary>
    public async Task<Result<ProductResponse>> HandleAsync(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (product is null)
        {
            return ProductErrors.NotFound(id);
        }

        product.Update(request.Name, request.Description, request.Price, request.Stock, time.GetUtcNow());
        await db.SaveChangesAsync(ct);
        return ProductResponse.From(product);
    }
}

#endregion

#region Endpoint

internal static class UpdateProduct
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPut("/{id:guid}", Handle).WithName("UpdateProduct")
            .WithValidation<UpdateProductRequest>()
            .ProducesProblem(StatusCodes.Status404NotFound);

    private static async Task<Results<Ok<ProductResponse>, ProblemHttpResult>> Handle(
        Guid id, UpdateProductRequest request, UpdateProductHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(id, request, ct);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}

#endregion
