using System.Security.Claims;
using Ako.Api.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;

namespace Ako.Api.Features.Auth;

// Tarayıcıyla sosyal giriş (web ve mobil aynı akış):
//   1) GET /auth/external/{provider}?returnUrl=…  → sağlayıcının giriş sayfasına yönlendirir
//   2) Sağlayıcı → GET /auth/external/callback     → kullanıcı bulunur/oluşturulur
//   3) returnUrl?code=…  (hata varsa ?error=<kod>) → istemci kodu POST /auth/exchange ile token'a çevirir
// Bu adresler tarayıcıda açılır, fetch ile çağrılmaz; bu yüzden OpenAPI'ye (api-client'a) girmez.

#region İş mantığı

public sealed class ExternalLoginCallbackHandler(
    SignInManager<AppUser> signIn, ExternalUserResolver resolver, LoginCodeStore codes)
{
    /// <summary>Sağlayıcıdan dönen kimliği kullanıcıya çevirir ve tek kullanımlık giriş kodu üretir.</summary>
    public async Task<Result<string>> HandleAsync(CancellationToken ct)
    {
        var info = await signIn.GetExternalLoginInfoAsync();
        var provider = info is null ? null : ExternalProviders.All.FirstOrDefault(p => p.Scheme == info.LoginProvider);
        if (info is null || provider is null)
        {
            return Error.Failure("auth.external_failed");
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        var user = await resolver.ResolveAsync(new ExternalIdentity(provider, info.ProviderKey, email));

        await signIn.Context.SignOutAsync(IdentityConstants.ExternalScheme); // geçici çerez artık gereksiz
        return user.IsSuccess ? await codes.CreateAsync(user.Value.Id, ct) : user.Error;
    }
}

#endregion

#region Endpoint

internal static class ExternalLogin
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/external/callback", Callback).ExcludeFromDescription();
        group.MapGet("/external/{provider}", Start).ExcludeFromDescription();
    }

    private static Results<ChallengeHttpResult, ProblemHttpResult> Start(
        string provider, string returnUrl, IConfiguration configuration, SignInManager<AppUser> signIn)
    {
        var p = ExternalProviders.Find(provider);
        if (p is null || !ExternalProviders.IsConfigured(configuration, p))
        {
            return AuthErrors.ProviderUnavailable(provider).ToProblem();
        }

        if (!AuthSetup.IsAllowedReturnUrl(configuration, returnUrl))
        {
            return AuthErrors.InvalidReturnUrl().ToProblem();
        }

        var callback = QueryHelpers.AddQueryString("/auth/external/callback", "returnUrl", returnUrl);
        var properties = signIn.ConfigureExternalAuthenticationProperties(p.Scheme, callback);
        return TypedResults.Challenge(properties, [p.Scheme]);
    }

    private static async Task<Results<RedirectHttpResult, ProblemHttpResult>> Callback(
        string returnUrl, IConfiguration configuration, ExternalLoginCallbackHandler handler, CancellationToken ct)
    {
        if (!AuthSetup.IsAllowedReturnUrl(configuration, returnUrl))
        {
            return AuthErrors.InvalidReturnUrl().ToProblem();
        }

        var result = await handler.HandleAsync(ct);
        return TypedResults.Redirect(result.IsSuccess
            ? QueryHelpers.AddQueryString(returnUrl, "code", result.Value)
            : QueryHelpers.AddQueryString(returnUrl, "error", result.Error.Code));
    }
}

#endregion
