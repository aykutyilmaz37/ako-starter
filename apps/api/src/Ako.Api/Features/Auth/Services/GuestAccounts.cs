using System.Security.Claims;
using Ako.Api.Common;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Ako.Api.Features.Auth;

/// <summary>
/// Misafir kullanıcılar: oluşturma ve gerçek bir hesaba geçiş. Misafir, e-postası ve şifresi olmayan sıradan bir
/// Identity kullanıcısıdır (rol <see cref="AppRoles.Guest"/>); bu yüzden her endpoint onu bearer token'la tanır.
/// </summary>
public sealed class GuestAccounts(
    UserManager<AppUser> users,
    IEnumerable<IGuestDataMerger> mergers,
    IOptionsMonitor<BearerTokenOptions> bearer,
    TimeProvider time)
{
    public async Task<Result<AppUser>> CreateAsync()
    {
        var user = new AppUser
        {
            // Kullanıcı adı tekil olmak zorunda; e-posta yok.
            UserName = $"guest-{Guid.NewGuid():N}",
            LastActiveAt = time.GetUtcNow(),
        };

        var created = await users.CreateAsync(user);
        if (!created.Succeeded)
        {
            return AuthErrors.UserCreationFailed();
        }

        await users.AddToRoleAsync(user, AppRoles.Guest);
        return user;
    }

    /// <summary>
    /// Misafirin verisini hedef (kayıtlı) kullanıcıya taşır ve misafiri siler. Misafirin sahibi olduğunu, misafirin
    /// refresh token'ını sunarak kanıtlar: token çözülür, süresi ve rolü doğrulanır. İstemci misafirken aldığı
    /// token'ı saklar; kayıt, e-posta/şifre girişi, sosyal ve native giriş sonrası hep bu uçla "talep eder", böylece
    /// tüm giriş yolları aynı kuralı kullanır ve giriş yanıtı misafir verisi taşınmadan istemciye dönmez.
    /// </summary>
    public async Task<Result> ClaimAsync(AppUser target, string guestRefreshToken, CancellationToken ct)
    {
        var ticket = bearer.Get(IdentityConstants.BearerScheme).RefreshTokenProtector.Unprotect(guestRefreshToken);
        var principal = ticket?.Principal;
        if (ticket is null || principal is null
            || ticket.Properties.ExpiresUtc is not { } expires || expires <= time.GetUtcNow()
            || !principal.IsInRole(AppRoles.Guest)
            || !Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var guestId))
        {
            return AuthErrors.InvalidGuestToken();
        }

        // Kullanıcı zaten taşınmış/silinmişse (ör. istek tekrarlandı) sonuç "yapıldı" sayılır: idempotent.
        if (guestId == target.Id || await users.FindByIdAsync(guestId.ToString()) is not { } guest
            || !await users.IsInRoleAsync(guest, AppRoles.Guest))
        {
            return Result.Success();
        }

        foreach (var merger in mergers)
        {
            await merger.MergeAsync(guestId, target.Id, ct);
        }

        await users.DeleteAsync(guest);
        return Result.Success();
    }

    /// <summary>Süresi dolan misafirin verisini ve kendisini siler.</summary>
    public async Task DeleteAsync(AppUser guest, CancellationToken ct)
    {
        foreach (var merger in mergers)
        {
            await merger.DeleteAsync(guest.Id, ct);
        }

        await users.DeleteAsync(guest);
    }

    /// <summary>Misafirin "son görülme" zamanını (en fazla günde bir kez) günceller; temizlik işi bunu kullanır.</summary>
    public async Task TouchAsync(AppUser guest)
    {
        var now = time.GetUtcNow();
        if (now - guest.LastActiveAt < TimeSpan.FromHours(12))
        {
            return;
        }

        guest.LastActiveAt = now;
        await users.UpdateAsync(guest);
    }
}
