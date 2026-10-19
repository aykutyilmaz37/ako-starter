namespace Ako.Api.Features.Products;

// ÖRNEK ÖZELLİK — iki grup adres:
//   /products        → herkese açık okuma (listeleme, detay); site kullanır
//   /admin/products  → yönetim (ekleme, güncelleme, silme); yalnızca iç ağdaki API örneğinde ve Admin rolüyle
public static class ProductEndpoints
{
    // WithName değerleri OpenAPI operationId olur; Orval hook adlarını buradan üretir
    // (ListProducts → useListProducts, AdminCreateProduct → useAdminCreateProduct…).
    public static IEndpointRouteBuilder MapProducts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/products").WithTags("Products");

        ListProducts.Map(group);
        GetProduct.Map(group);

        return app;
    }

    // ako:begin auth
    /// <summary>Backoffice adresleri. Yalnızca admin grubu açıksa çağrılır (bkz. AdminEndpoints); grup Admin rolü ister.</summary>
    public static RouteGroupBuilder MapProductsAdmin(this RouteGroupBuilder admin)
    {
        var group = admin.MapGroup("/products").WithTags("Admin: Products");

        CreateProduct.Map(group);
        UpdateProduct.Map(group);
        DeleteProduct.Map(group);

        return admin;
    }
    // ako:end auth
}
