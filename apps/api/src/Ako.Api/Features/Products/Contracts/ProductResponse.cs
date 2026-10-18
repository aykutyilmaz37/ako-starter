namespace Ako.Api.Features.Products;

// API'nin istemciye döndüğü JSON (api-client'ta ProductResponse tipi olur)

public sealed record ProductResponse(
    Guid Id,
    string Sku,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static ProductResponse From(Product p) =>
        new(p.Id, p.Sku, p.Name, p.Description, p.Price, p.Stock, p.CreatedAt, p.UpdatedAt);
}
