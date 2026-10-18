using Ako.Api.Common;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

// Şifre sıfırlama (6 haneli kod), e-posta doğrulamayla aynı akış:
//   POST /auth/password/forgot  { email }                     → kodu gönderir   ("Şifremi unuttum")
//   POST /auth/password/reset   { email, code, newPassword }  → yeni şifreyi kaydeder
// Şifresi olmayan (yalnızca sosyal girişle açılmış) hesaplar da bu yolla şifre edinebilir.

#region İstekler

public sealed record ForgotPasswordRequest(string Email);

public sealed record ResetPasswordRequest(string Email, string Code, string NewPassword);

#endregion

#region Doğrulama

internal sealed class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator() => RuleFor(x => x.Email).NotEmpty().EmailAddress();
}

internal sealed class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Code).NotEmpty().Length(6);
        RuleFor(x => x.NewPassword).NotEmpty(); // uzunluk/karakter kuralları Identity'de (hatalar newPassword alanına düşer)
    }
}

#endregion

#region İş mantığı

public sealed class PasswordResetHandler(UserManager<AppUser> users, EmailCodes codes)
{
    /// <summary>Kullanıcı varsa kod gönderir; yoksa sessizce başarılı döner.</summary>
    public async Task<Result> ForgotAsync(ForgotPasswordRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email);
        return user is null
            ? Result.Success()
            : await codes.SendAsync(user, EmailCodePurpose.ResetPassword, user.Email!, ct);
    }

    /// <summary>Kodu doğrular ve şifreyi değiştirir. Kod e-postaya gittiği için e-posta da doğrulanmış sayılır.</summary>
    public async Task<(Result Result, IEnumerable<IdentityError> PasswordErrors)> ResetAsync(ResetPasswordRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return (AuthErrors.InvalidCode(), []);
        }

        var (result, errors) = await codes.VerifyAsync(user, EmailCodePurpose.ResetPassword, request.Code, request.NewPassword, ct);
        if (result.IsSuccess && !errors.Any() && !user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await users.UpdateAsync(user);
        }

        return (result, errors);
    }
}

#endregion

#region Endpoint

internal static class PasswordReset
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapPost("/password/forgot", Forgot).WithName("ForgotPassword")
            .WithValidation<ForgotPasswordRequest>()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapPost("/password/reset", Reset).WithName("ResetPassword")
            .WithValidation<ResetPasswordRequest>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> Forgot(
        ForgotPasswordRequest request, PasswordResetHandler handler, CancellationToken ct)
    {
        var result = await handler.ForgotAsync(request, ct);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }

    private static async Task<Results<NoContent, ValidationProblem, ProblemHttpResult>> Reset(
        ResetPasswordRequest request, PasswordResetHandler handler, CancellationToken ct)
    {
        var (result, passwordErrors) = await handler.ResetAsync(request, ct);
        if (!result.IsSuccess)
        {
            return result.Error.ToProblem();
        }

        return passwordErrors.Any()
            ? TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["newPassword"] = [.. passwordErrors.Select(e => e.Description)] })
            : TypedResults.NoContent();
    }
}

#endregion
