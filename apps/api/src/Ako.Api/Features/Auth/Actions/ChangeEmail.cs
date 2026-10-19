using System.Security.Claims;
using Ako.Api.Common;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// E-posta değişikliği (6 haneli kod, giriş gerekir), diğer iki akışla aynı:
//   POST /auth/email/change          { newEmail }        → yeni adrese kod gönderir
//   POST /auth/email/change/confirm  { newEmail, code }  → e-postayı (ve e-posta olan kullanıcı adını) değiştirir

#region İstekler

public sealed record ChangeEmailRequest(string NewEmail);

public sealed record ConfirmChangeEmailRequest(string NewEmail, string Code);

#endregion

#region Doğrulama

internal sealed class ChangeEmailRequestValidator : AbstractValidator<ChangeEmailRequest>
{
    public ChangeEmailRequestValidator() => RuleFor(x => x.NewEmail).NotEmpty().EmailAddress();
}

internal sealed class ConfirmChangeEmailRequestValidator : AbstractValidator<ConfirmChangeEmailRequest>
{
    public ConfirmChangeEmailRequestValidator()
    {
        RuleFor(x => x.NewEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Code).NotEmpty().Length(6);
    }
}

#endregion

#region İş mantığı

public sealed class ChangeEmailHandler(UserManager<AppUser> users, EmailCodes codes)
{
    /// <summary>Yeni adres boştaysa ona kod gönderir.</summary>
    public async Task<Result> RequestAsync(ClaimsPrincipal principal, ChangeEmailRequest request, CancellationToken ct)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null)
        {
            return AuthErrors.InvalidCode();
        }

        if (await users.FindByEmailAsync(request.NewEmail) is not null || await users.FindByNameAsync(request.NewEmail) is not null)
        {
            return AuthErrors.EmailInUse();
        }

        return await codes.SendAsync(user, EmailCodePurpose.ChangeEmail, request.NewEmail, ct);
    }

    /// <summary>Kodu doğrular ve e-postayı değiştirir.</summary>
    public async Task<Result> ConfirmAsync(ClaimsPrincipal principal, ConfirmChangeEmailRequest request, CancellationToken ct)
    {
        var user = await users.GetUserAsync(principal);
        if (user is null)
        {
            return AuthErrors.InvalidCode();
        }

        var (result, errors) = await codes.VerifyAsync(user, EmailCodePurpose.ChangeEmail, request.Code, request.NewEmail, ct);
        return result.IsSuccess && errors.Any() ? AuthErrors.EmailInUse() : result;
    }
}

#endregion

#region Endpoint

internal static class ChangeEmail
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/email/change", Request).WithName("ChangeEmail")
            .RequireAuthorization(AppPolicies.Member) // misafirin e-postası yok; önce kayıt olur
            .WithValidation<ChangeEmailRequest>()
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapPost("/email/change/confirm", Confirm).WithName("ConfirmChangeEmail")
            .RequireAuthorization(AppPolicies.Member) // misafirin e-postası yok; önce kayıt olur
            .WithValidation<ConfirmChangeEmailRequest>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> Request(
        ChangeEmailRequest request, ClaimsPrincipal principal, ChangeEmailHandler handler, CancellationToken ct)
    {
        var result = await handler.RequestAsync(principal, request, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> Confirm(
        ConfirmChangeEmailRequest request, ClaimsPrincipal principal, ChangeEmailHandler handler, CancellationToken ct)
    {
        var result = await handler.ConfirmAsync(principal, request, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}

#endregion
