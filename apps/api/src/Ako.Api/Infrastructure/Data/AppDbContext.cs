using Ako.Api.Features.Auth;
using Ako.Api.Features.Localization;
using Ako.Api.Features.Products;
using Ako.Api.Features.Todos;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Infrastructure.Data;

// Handler'lar DbContext'i doğrudan kullanır; ayrı bir repository katmanı yoktur.
// IdentityDbContext kullanıcı, rol ve giriş tablolarını ekler (bkz. Features/Auth).
public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options), IDataProtectionKeyContext
{
    /// <summary>
    /// Token ve çerezleri şifreleyen anahtarlar. Veritabanında durdukları için container yeniden başlasa
    /// ya da birden fazla API örneği çalışsa da oturumlar geçerli kalır.
    /// </summary>
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<Todo> Todos => Set<Todo>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Translation> Translations => Set<Translation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Identity tabloları önce kurulur

        // Her özellik kendi IEntityTypeConfiguration sınıfını taşır; burada toplu olarak uygulanır.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
