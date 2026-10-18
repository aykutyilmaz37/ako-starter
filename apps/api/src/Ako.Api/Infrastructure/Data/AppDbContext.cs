using Ako.Api.Features.Products;
using Ako.Api.Features.Todos;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Infrastructure.Data;

// Handler'lar DbContext'i doğrudan kullanır; ayrı bir repository katmanı yoktur.
public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Todo> Todos => Set<Todo>();
    public DbSet<Product> Products => Set<Product>();

    // Her özellik kendi IEntityTypeConfiguration sınıfını taşır; burada toplu olarak uygulanır.
    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
