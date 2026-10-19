using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Auth;

/// <summary>
/// Uzun süredir görülmeyen misafirleri (ve verilerini) siler. Süre "Auth:Guest:RetentionDays" (varsayılan 30);
/// 0 ya da negatifse temizlik kapalıdır.
/// </summary>
public sealed class GuestCleanupService(
    IServiceProvider services, IConfiguration configuration, TimeProvider time, ILogger<GuestCleanupService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                await CleanAsync(stoppingToken);
            }
            catch (Exception e) when (e is not OperationCanceledException)
            {
                // Veritabanı hazır değilse (ör. build sırasında) ya da geçici bir hata: bir sonraki turda yeniden denenir.
                logger.LogWarning(e, "Misafir temizliği başarısız oldu.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    /// <summary>Tek bir temizlik turu; testler doğrudan çağırır. Silinen misafir sayısını döner.</summary>
    public async Task<int> CleanAsync(CancellationToken ct)
    {
        var days = configuration.GetValue("Auth:Guest:RetentionDays", 30);
        if (days <= 0 || string.IsNullOrWhiteSpace(configuration.GetConnectionString("Default")))
        {
            return 0;
        }

        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var guests = scope.ServiceProvider.GetRequiredService<GuestAccounts>();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

        var cutoff = time.GetUtcNow().AddDays(-days);
        var expired = await (
            from u in db.Users
            join ur in db.UserRoles on u.Id equals ur.UserId
            join r in db.Roles on ur.RoleId equals r.Id
            where r.Name == AppRoles.Guest && u.LastActiveAt < cutoff
            select u.Id).Take(500).ToListAsync(ct);

        foreach (var id in expired)
        {
            if (await users.FindByIdAsync(id.ToString()) is { } guest)
            {
                await guests.DeleteAsync(guest, ct);
            }
        }

        if (expired.Count > 0)
        {
            logger.LogInformation("{Count} süresi dolmuş misafir silindi.", expired.Count);
        }

        return expired.Count;
    }
}
