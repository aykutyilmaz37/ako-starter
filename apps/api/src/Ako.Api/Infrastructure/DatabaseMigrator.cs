using Ako.Api.Common; // ako:auth
using Ako.Api.Features.Auth; // ako:auth
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Identity; // ako:auth
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Infrastructure;

/// <summary>
/// Veritabanını hazırlar:
/// 1) Bekleyen migration'ları uygular.
/// 2) "Auth:Admin" ayarı doluysa ve hesap yoksa ilk Admin hesabını oluşturur.
/// Development'ta açılışta (DevDataInitializer), production'da deploy adımında ve API açılmadan önce bir kez çalışır:
///   dotnet Ako.Api.dll migrate   (compose.prod.yaml'daki "migrate" servisi)
/// Tekrar çalıştırmak güvenlidir: uygulanmış migration ve var olan hesap atlanır.
/// </summary>
internal static class DatabaseMigrator
{
    public static async Task RunAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync(ct);
        await EnsureAdminAsync(scope.ServiceProvider); // ako:auth
    }

    // ako:begin auth
    private static async Task EnsureAdminAsync(IServiceProvider services)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(DatabaseMigrator));
        var email = configuration["Auth:Admin:Email"];
        var password = configuration["Auth:Admin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var users = services.GetRequiredService<UserManager<AppUser>>();
        if (await users.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var admin = new AppUser { UserName = email, Email = email, EmailConfirmed = true };
        var created = await users.CreateAsync(admin, password);
        if (!created.Succeeded)
        {
            logger.LogWarning("Admin hesabı oluşturulamadı: {Errors}", string.Join(", ", created.Errors.Select(e => e.Code)));
            return;
        }

        await users.AddToRolesAsync(admin, [AppRoles.Admin, AppRoles.User]);
        logger.LogInformation("Admin hesabı oluşturuldu: {Email}", email);
    }
    // ako:end auth
}
