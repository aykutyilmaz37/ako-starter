using Ako.Api.Common;

namespace Ako.Api.Features.Products;

// ÖRNEK ÖZELLİK: CRUD, sayfalama, arama ve rol bazlı yetkiyi gösterir. Projede gerekmiyorsa silin.
// Veritabanındaki "products" tablosunun C# karşılığı

public sealed class Product : IEntity, IAuditable
{
    public const int NameMaxLength = 200;
    public const int SkuMaxLength = 64;
    public const int DescriptionMaxLength = 2000;
    public const int ImageUrlMaxLength = 500;

    private Product() { } // EF Core veritabanından okurken bu boş constructor'ı kullanır.

    // "private set": alanlar dışarıdan doğrudan değiştirilemez, yalnızca aşağıdaki metotlarla.
    // Böylece kurallar (trim, SKU büyük harf…) tek bir yerde uygulanır.
    public Guid Id { get; private set; }
    public string Sku { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public ProductCategory Category { get; private set; }

    /// <summary>API'nin kendi görseli ("/images/products/x.svg") ya da tam adres ("https://…").</summary>
    public string? ImageUrl { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }

    // Denetim alanları (IAuditable): kayıt sırasında otomatik dolar, elle atanmaz.
    public DateTimeOffset CreatedAt { get; private set; }
    public Guid? CreatedBy { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public Guid? UpdatedBy { get; private set; }

    /// <summary>Yeni ürün oluşturur. Id zamana göre sıralı (UUID v7) üretilir.</summary>
    public static Product Create(
        string sku, string name, string? description, ProductCategory category, string? imageUrl, decimal price, int stock)
    {
        var product = new Product
        {
            Id = Guid.CreateVersion7(),
            Sku = NormalizeSku(sku),
        };
        product.Update(name, description, category, imageUrl, price, stock);
        return product;
    }

    /// <summary>Düzenlenebilir alanları günceller. SKU değiştirilemez.</summary>
    public void Update(string name, string? description, ProductCategory category, string? imageUrl, decimal price, int stock)
    {
        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        Category = category;
        ImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
        Price = price;
        Stock = stock;
    }

    /// <summary>SKU büyük/küçük harf duyarsız tekildir; "abc-1" ve "ABC-1" aynı SKU sayılır.</summary>
    public static string NormalizeSku(string sku) => sku.Trim().ToUpperInvariant();
}
