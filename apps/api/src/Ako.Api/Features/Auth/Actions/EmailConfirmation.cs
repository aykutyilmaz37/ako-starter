using Ako.Api.Common;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// E-posta doğrulama (6 haneli kod). Kayıttan sonra kod otomatik gider; bu iki adres:
//   POST /auth/email/confirm/send  { email }        → kodu (yeniden) gönderir    ("Kod gelmedi" butonu)
//   POST /auth/email/confirm       { email, code }  → e-postayı doğrular
// Gönderim adresleri, e-posta kayıtlı olmasa da 204 döner: hangi adreslerin kayıtlı olduğu dışarıdan anlaşılmasın.

#region İstekler

public sealed record SendConfirmationCodeRequest(string Email);

public sealed record ConfirmEmailRequest(string Email, string Code);

#endregion

#region Doğrulama

internal sealed class SendConfirmationCodeRequestValidator : AbstractValidator<SendConfirmationCodeRequest>
{
    public SendConfirmationCodeRequestValidator() => RuleFor(x => x.Email).NotEmpty().EmailAddress();
}

internal sealed class ConfirmEmailRequestValidator : AbstractValidator<ConfirmEmailRequest>
{
    public ConfirmEmailRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Code).NotEmpty().Length(6);
    }
}

#endregion

#region İş mantığı

public sealed class EmailConfirmationHandler(UserManager<AppUser> users, EmailCodes codes)
{
    /// <summary>Kullanıcı varsa ve e-postası doğrulanmamışsa kod gönderir.</summary>
    public async Task<Result> SendAsync(SendConfirmationCodeRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email);
        return user is null || user.EmailConfirmed
            ? Result.Success()
            : await codes.SendAsync(user, EmailCodePurpose.ConfirmEmail, user.Email!, ct);
    }

    /// <summary>Kodu doğrular ve e-postayı onaylı işaretler.</summary>
    public async Task<Result> ConfirmAsync(ConfirmEmailRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return AuthErrors.InvalidCode();
        }

        var (result, _) = await codes.VerifyAsync(user, EmailCodePurpose.ConfirmEmail, request.Code, null, ct);
        return result;
    }
}

#endregion

#region Endpoint

internal static class EmailConfirmation
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/email/confirm/send", Send).WithName("SendConfirmationCode")
            .WithValidation<SendConfirmationCodeRequest>()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapPost("/email/confirm", Confirm).WithName("ConfirmEmail")
            .WithValidation<ConfirmEmailRequest>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> Send(
        SendConfirmationCodeRequest request, EmailConfirmationHandler handler, CancellationToken ct)
    {
        var result = await handler.SendAsync(request, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> Confirm(
        ConfirmEmailRequest request, EmailConfirmationHandler handler, CancellationToken ct)
    {
        var result = await handler.ConfirmAsync(request, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}

#endregion
