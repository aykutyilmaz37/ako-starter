using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

internal static class TokenIssuer
{
    /// <summary>
    /// Kullanıcı için access + refresh token üretir ve yanıta yazar; /auth/login'in döndüğü
    /// AccessTokenResponse ile birebir aynıdır. Böylece istemci tüm giriş yollarını aynı şekilde işler.
    /// </summary>
    public static Task IssueAsync(SignInManager<AppUser> signIn, AppUser user)
    {
        signIn.AuthenticationScheme = IdentityConstants.BearerScheme;
        return signIn.SignInAsync(user, isPersistent: false);
    }
}
