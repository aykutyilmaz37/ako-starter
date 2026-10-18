using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Ako.Api.Resources;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Products;

// POST /products → yeni ürün, 201 + oluşan ürün. SKU doluysa 409.

#region İstek — gönderilen JSON gövdesi

public sealed record CreateProductRequest(string Sku, string Name, string? Description, decimal Price, int Stock);

#endregion

#region Doğrulama — alan hataları 400 ile { errors: { sku: [...], price: [...] } } olarak döner

internal sealed class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Sku)
            .NotEmpty()
            .MaximumLength(Product.SkuMaxLength)
            .Matches("^[A-Za-z0-9-]+$").WithMessage(_ => Messages.Get("products.sku_format"));
        RuleFor(x => x.Name).NotEmpty().MaximumLength(Product.NameMaxLength);
        RuleFor(x => x.Description).MaximumLength(Product.DescriptionMaxLength);
        RuleFor(x => x.Price).GreaterThan(0).PrecisionScale(12, 2, ignoreTrailingZeros: true);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
    }
}

#endregion

#region İş mantığı

public sealed class CreateProductHandler(AppDbContext db, TimeProvider time)
{
    /// <summary>SKU boştaysa ürünü kaydeder; doluysa "products.sku_taken" hatası döner.</summary>
    public async Task<Result<ProductResponse>> HandleAsync(CreateProductRequest request, CancellationToken ct)
    {
        // Tekillik veritabanında unique index ile de korunur; bu kontrol kullanıcıya anlamlı bir 409 döner.
        var sku = Product.NormalizeSku(request.Sku);
        if (await db.Products.AnyAsync(p => p.Sku == sku, ct))
        {
            return ProductErrors.SkuTaken(sku);
        }

        var product = Product.Create(sku, request.Name, request.Description, request.Price, request.Stock, time.GetUtcNow());
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);
        return ProductResponse.From(product);
    }
}

#endregion

#region Endpoint

internal static class CreateProduct
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapPost("/", Handle).WithName("CreateProduct")
            .RequireAuthorization()
            .WithValidation<CreateProductRequest>()
            .ProducesProblem(StatusCodes.Status409Conflict);

    private static async Task<Results<Created<ProductResponse>, ProblemHttpResult>> Handle(
        CreateProductRequest request, CreateProductHandler handler, CancellationToken ct)
    {
        var result = await handler.HandleAsync(request, ct);
        return result.IsSuccess
            ? TypedResults.Created($"/products/{result.Value.Id}", result.Value)
            : result.Error.ToProblem();
    }
}

#endregion
