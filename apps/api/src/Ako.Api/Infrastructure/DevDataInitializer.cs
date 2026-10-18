using Ako.Api.Common;
using Ako.Api.Features.Auth;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Infrastructure;

/// <summary>
/// Yalnızca Development'ta, uygulama açılırken çalışır:
/// 1) Bekleyen migration'ları uygular (elle "dotnet ef database update" gerekmez).
/// 2) "Auth:Admin" ayarı doluysa Admin hesabını oluşturur.
/// Production'da migration'lar deploy adımında ayrıca çalıştırılmalıdır.
/// </summary>
internal sealed class DevDataInitializer(IServiceProvider services, IConfiguration configuration, ILogger<DevDataInitializer> logger)
    : IHostedService
{
    public async Task StartAsync(CancellationToken ct)
    {
        using var scope = services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync(ct);

        var email = configuration["Auth:Admin:Email"];
        var password = configuration["Auth:Admin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
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

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
