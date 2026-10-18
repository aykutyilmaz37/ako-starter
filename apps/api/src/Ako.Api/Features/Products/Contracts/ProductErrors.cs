using Ako.Api.Common;

namespace Ako.Api.Features.Products;

// Kod istemciye "code" alanında gider; metni Resources/Localization/Messages*.resx'te

internal static class ProductErrors
{
    public static Error NotFound(Guid id) => Error.NotFound("products.not_found", id);

    public static Error SkuTaken(string sku) => Error.Conflict("products.sku_taken", sku);
}
