using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// GET /auth/me → giriş yapmış kullanıcının bilgileri ve rolleri (token gerekir)

#region İş mantığı

// ako:begin guest
public sealed class GetMeHandler(UserManager<AppUser> users, GuestAccounts guests)
// ako:else guest
//~ public sealed class GetMeHandler(UserManager<AppUser> users)
// ako:end guest
{
    /// <summary>Token'daki kullanıcıyı bulur; rollerini ve (sosyal giriş açıksa) bağlı sosyal hesaplarını ekler.</summary>
    public async Task<MeResponse?> HandleAsync(ClaimsPrincipal principal)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null)
        {
            return null;
        }

        var roles = await users.GetRolesAsync(user);
        // ako:begin guest
        if (roles.Contains(Ako.Api.Common.AppRoles.Guest))
        {
            await guests.TouchAsync(user); // temizlik işi için "son görülme"
        }
        // ako:end guest

        // ako:begin social
        var logins = await users.GetLoginsAsync(user);
        return new MeResponse(
            user.Id, user.Email, user.UserName!, user.EmailConfirmed,
            [.. roles],
            [.. logins.Select(l => ExternalProviders.All.FirstOrDefault(p => p.Scheme == l.LoginProvider)?.Slug ?? l.LoginProvider)]);
        // ako:else social
        //~ return new MeResponse(user.Id, user.Email, user.UserName!, user.EmailConfirmed, [.. roles], []);
        // ako:end social
    }
}

#endregion

#region Endpoint

internal static class GetMe
{
    public static void Map(RouteGroupBuilder group) =>
        group.MapGet("/me", Handle).WithName("GetMe").RequireAuthorization();

    private static async Task<Results<Ok<MeResponse>, UnauthorizedHttpResult>> Handle(
        ClaimsPrincipal principal, GetMeHandler handler) =>
        await handler.HandleAsync(principal) is { } me ? TypedResults.Ok(me) : TypedResults.Unauthorized();
}

#endregion
