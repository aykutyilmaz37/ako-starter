using Ako.Api.Common;

namespace Ako.Api.Features.Products;

// Veritabanındaki "products" tablosunun C# karşılığı

public sealed class Product : IEntity
{
    public const int NameMaxLength = 200;
    public const int SkuMaxLength = 64;
    public const int DescriptionMaxLength = 2000;

    private Product() { } // EF Core veritabanından okurken bu boş constructor'ı kullanır.

    // "private set": alanlar dışarıdan doğrudan değiştirilemez, yalnızca aşağıdaki metotlarla.
    // Böylece kurallar (trim, SKU büyük harf, UpdatedAt…) tek bir yerde uygulanır.
    public Guid Id { get; private set; }
    public string Sku { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public int Stock { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    /// <summary>Yeni ürün oluşturur. Id zamana göre sıralı (UUID v7) üretilir.</summary>
    public static Product Create(string sku, string name, string? description, decimal price, int stock, DateTimeOffset now)
    {
        var product = new Product
        {
            Id = Guid.CreateVersion7(now),
            Sku = NormalizeSku(sku),
            CreatedAt = now,
        };
        product.Update(name, description, price, stock, now);
        return product;
    }

    /// <summary>Düzenlenebilir alanları günceller. SKU değiştirilemez.</summary>
    public void Update(string name, string? description, decimal price, int stock, DateTimeOffset now)
    {
        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        Price = price;
        Stock = stock;
        UpdatedAt = now;
    }

    /// <summary>SKU büyük/küçük harf duyarsız tekildir; "abc-1" ve "ABC-1" aynı SKU sayılır.</summary>
    public static string NormalizeSku(string sku) => sku.Trim().ToUpperInvariant();
}
