using Ako.Api.Features.Auth; // ako:auth
using Ako.Api.Features.Localization; // ako:lang
using Ako.Api.Features.Products;
using Ako.Api.Features.Todos; // ako:auth
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity; // ako:auth
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // ako:auth
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Infrastructure.Data;

// Handler'lar DbContext'i doğrudan kullanır; ayrı bir repository katmanı yoktur.
// IdentityDbContext kullanıcı, rol ve giriş tablolarını ekler (bkz. Features/Auth).
public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    // ako:begin auth
    : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options), IDataProtectionKeyContext
    // ako:else auth
    //~ : DbContext(options), IDataProtectionKeyContext
    // ako:end auth
{
    /// <summary>
    /// Token ve çerezleri şifreleyen anahtarlar. Veritabanında durdukları için container yeniden başlasa
    /// ya da birden fazla API örneği çalışsa da oturumlar geçerli kalır.
    /// </summary>
    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<Todo> Todos => Set<Todo>(); // ako:auth
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Language> Languages => Set<Language>(); // ako:lang
    public DbSet<Translation> Translations => Set<Translation>(); // ako:lang

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // Identity tabloları önce kurulur

        // Her özellik kendi IEntityTypeConfiguration sınıfını taşır; burada toplu olarak uygulanır.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
