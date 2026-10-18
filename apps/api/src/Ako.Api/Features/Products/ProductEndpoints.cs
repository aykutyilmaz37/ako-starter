namespace Ako.Api.Features.Products;

// Tüm /products adreslerini tek yerden kaydeder (Program.cs bunu çağırır)

// ÖRNEK ÖZELLİK — yetkiler:
//   listeleme ve detay → herkese açık
//   ekleme ve güncelleme → giriş yapmış kullanıcı
//   silme → yalnızca Admin
public static class ProductEndpoints
{
    // WithName değerleri OpenAPI operationId olur; Orval hook adlarını buradan üretir
    // (ListProducts → useListProducts, CreateProduct → useCreateProduct…).
    public static IEndpointRouteBuilder MapProducts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/products").WithTags("Products");

        ListProducts.Map(group);
        GetProduct.Map(group);
        CreateProduct.Map(group);
        UpdateProduct.Map(group);
        DeleteProduct.Map(group);

        return app;
    }
}
