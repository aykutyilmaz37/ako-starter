using Ako.Api.Common;
using Ako.Api.Infrastructure;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Ako.Api.Features.Auth;

public static class AuthEndpoints
{
    /// <summary>
    /// Auth middleware'leri. Kapatılan Identity adresleri model bağlamadan (gövde okunmadan) önce
    /// 404 ile kesilir; endpoint filtresi bunun için yeterli değildir.
    /// </summary>
    public static WebApplication UseAuth(this WebApplication app)
    {
        app.UseAuthentication();
        app.UseAuthorization();
        app.Use((context, next) =>
        {
            if (context.GetEndpoint()?.Metadata.GetMetadata<DisabledEndpoint>() is not null)
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                return Task.CompletedTask;
            }

            return next(context);
        });
        return app;
    }

    private sealed class DisabledEndpoint
    {
        public static readonly DisabledEndpoint Instance = new();
    }

    /// <summary>
    /// Identity'nin link tabanlı adresleri. Bu projede yerlerine 6 haneli kodla çalışan
    /// /auth/email/* ve /auth/password/* kullanılır; bunlar 404 döner ve OpenAPI'de görünmez.
    /// </summary>
    private static readonly string[] DisabledIdentityEndpoints =
        ["/confirmEmail", "/resendConfirmationEmail", "/forgotPassword", "/resetPassword"];

    /// <summary>
    /// Identity'nin hazır endpoint'lerinin adı yoktur; OpenAPI operationId ve dolayısıyla
    /// api-client hook adları (useLogin, useRegister…) buradan gelir.
    /// </summary>
    private static readonly Dictionary<(string Method, string Path), string> IdentityEndpointNames = new()
    {
        [("POST", "/register")] = "Register",
        [("POST", "/login")] = "Login",
        [("POST", "/refresh")] = "RefreshToken",
        [("GET", "/manage/info")] = "GetAccountInfo",
        [("POST", "/manage/info")] = "UpdateAccountInfo",
        [("POST", "/manage/2fa")] = "ManageTwoFactor",
    };

    /// <summary>
    /// /auth altındaki tüm adresler:
    /// - Identity'nin hazır endpoint'leri: /register, /login, /refresh, /manage/info, /manage/2fa
    /// - E-posta kodları: /email/confirm(/send), /password/forgot, /password/reset, /email/change(/confirm)
    /// - Sosyal giriş: /providers, /external/*, /exchange, /native/{provider}
    /// - /me
    /// </summary>
    public static IEndpointRouteBuilder MapAuth(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth").RequireRateLimiting(AppRateLimits.Auth);

        var identity = group.MapIdentityApi<AppUser>();
        identity.Add(DisableLinkEndpoints);
        identity.Add(NameIdentityEndpoints);
        identity.AddEndpointFilter(AfterRegister);
        identity.AddEndpointFilter(BlockEmailChangeViaManageInfo);

        GetMe.Map(group);
        EmailConfirmation.Map(group);
        PasswordReset.Map(group);
        ChangeEmail.Map(group);
        GetProviders.Map(group);
        ExternalLogin.Map(group);
        ExchangeCode.Map(group);
        NativeLogin.Map(group);

        return app;
    }

    /// <summary>Backoffice adresleri (/admin/users…). Yalnızca admin grubu açıksa çağrılır (bkz. AdminEndpoints).</summary>
    public static RouteGroupBuilder MapAuthAdmin(this RouteGroupBuilder admin)
    {
        var users = admin.MapGroup("").WithTags("Admin: Users");
        ListUsers.Map(users);
        SetUserRoles.Map(users);
        return admin;
    }

    private static void NameIdentityEndpoints(EndpointBuilder endpoint)
    {
        if (endpoint is not RouteEndpointBuilder route || route.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault() is not { } methods)
        {
            return;
        }

        var name = IdentityEndpointNames.FirstOrDefault(n =>
            methods.HttpMethods.Contains(n.Key.Method) && route.RoutePattern.RawText?.EndsWith(n.Key.Path, StringComparison.Ordinal) == true).Value;
        if (name is not null)
        {
            endpoint.Metadata.Add(new EndpointNameMetadata(name));
        }
    }

    private static void DisableLinkEndpoints(EndpointBuilder endpoint)
    {
        if (endpoint is RouteEndpointBuilder route
            && DisabledIdentityEndpoints.Any(path => route.RoutePattern.RawText?.EndsWith(path, StringComparison.Ordinal) == true))
        {
            endpoint.Metadata.Add(new ExcludeFromDescriptionAttribute());
            endpoint.Metadata.Add(DisabledEndpoint.Instance); // UseAuth()'taki middleware 404 döner
        }
    }

    /// <summary>
    /// Identity'nin /register'ı rol atamaz ve link gönderir (bastırılır). Başarılı kayıttan sonra
    /// kullanıcıya User rolünü verir ve e-postasına 6 haneli doğrulama kodunu gönderir.
    /// </summary>
    private static async ValueTask<object?> AfterRegister(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var result = await next(context);

        if (context.Arguments.OfType<RegisterRequest>().FirstOrDefault() is { } request
            && result is INestedHttpResult { Result: Ok })
        {
            var services = context.HttpContext.RequestServices;
            var users = services.GetRequiredService<UserManager<AppUser>>();
            if (await users.FindByEmailAsync(request.Email) is { } user)
            {
                await users.AddToRoleAsync(user, AppRoles.User);
                await services.GetRequiredService<EmailCodes>()
                    .SendAsync(user, EmailCodePurpose.ConfirmEmail, user.Email!, context.HttpContext.RequestAborted);
            }
        }

        return result;
    }

    /// <summary>/manage/info'nun e-posta değiştirme kısmı link gönderir; bunun yerine /auth/email/change kullanılır.</summary>
    private static ValueTask<object?> BlockEmailChangeViaManageInfo(EndpointFilterInvocationContext context, EndpointFilterDelegate next) =>
        context.Arguments.OfType<InfoRequest>().FirstOrDefault() is { NewEmail: not null }
            ? ValueTask.FromResult<object?>(AuthErrors.UseEmailChangeEndpoint().ToProblem())
            : next(context);
}
