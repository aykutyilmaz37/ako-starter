using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ako.Api.Features.Products;

// Kolon uzunlukları, index'ler (migration'lar buradan üretilir)

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(p => p.Id).ValueGeneratedNever();
        builder.Property(p => p.Sku).HasMaxLength(Product.SkuMaxLength);
        builder.Property(p => p.Name).HasMaxLength(Product.NameMaxLength);
        builder.Property(p => p.Description).HasMaxLength(Product.DescriptionMaxLength);
        builder.Property(p => p.Category).HasConversion<string>().HasMaxLength(32);
        builder.Property(p => p.ImageUrl).HasMaxLength(Product.ImageUrlMaxLength);
        builder.Property(p => p.Price).HasPrecision(12, 2);

        builder.HasIndex(p => p.Sku).IsUnique();
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.Category);
    }
}
