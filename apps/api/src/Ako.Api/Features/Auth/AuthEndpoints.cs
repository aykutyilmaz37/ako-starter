using Ako.Api.Common;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Ako.Api.Features.Auth;

public static class AuthEndpoints
{
    /// <summary>
    /// /auth altındaki tüm adresler:
    /// - Identity'nin hazır endpoint'leri: /register, /login, /refresh, /confirmEmail, /resendConfirmationEmail,
    ///   /forgotPassword, /resetPassword, /manage/2fa, /manage/info
    /// - Bizim eklediklerimiz: /me, /providers, /external/*, /exchange, /native/{provider}
    /// </summary>
    public static IEndpointRouteBuilder MapAuth(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth");

        group.MapIdentityApi<AppUser>()
            .AddEndpointFilter(AssignUserRoleOnRegister);

        GetMe.Map(group);
        GetProviders.Map(group);
        ExternalLogin.Map(group);
        ExchangeCode.Map(group);
        NativeLogin.Map(group);

        return app;
    }

    /// <summary>Identity'nin /register'ı rol atamaz; başarılı kayıttan sonra kullanıcıya User rolünü verir.</summary>
    private static async ValueTask<object?> AssignUserRoleOnRegister(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var result = await next(context);

        if (context.Arguments.OfType<RegisterRequest>().FirstOrDefault() is { } request
            && result is INestedHttpResult { Result: Ok })
        {
            var users = context.HttpContext.RequestServices.GetRequiredService<UserManager<AppUser>>();
            if (await users.FindByEmailAsync(request.Email) is { } user)
            {
                await users.AddToRoleAsync(user, AppRoles.User);
            }
        }

        return result;
    }
}
