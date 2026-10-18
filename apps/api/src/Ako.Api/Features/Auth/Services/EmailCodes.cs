using Ako.Api.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Distributed;

namespace Ako.Api.Features.Auth;

/// <summary>E-postaya giden 6 haneli kodun amacı. Aynı akış (kod gönder → kodu doğrula) üçünde de kullanılır.</summary>
public enum EmailCodePurpose
{
    ConfirmEmail,
    ResetPassword,
    ChangeEmail,
}

/// <summary>
/// 6 haneli e-posta kodlarını üretir, gönderir ve doğrular.
/// - Kodu Identity üretir ve doğrular (TOTP, ~10 dk geçerli); ayrıca bir yerde saklanmaz.
/// - Aynı kişiye dakikada en fazla 1 kod gönderilir.
/// - 5 yanlış denemeden sonra o amaç için yeni kod istenene kadar doğrulama yapılmaz (kaba kuvvete karşı).
/// </summary>
public sealed class EmailCodes(UserManager<AppUser> users, IAppEmailSender sender, IDistributedCache cache)
{
    private const int MaxAttempts = 5;
    private static readonly TimeSpan ResendInterval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan AttemptWindow = TimeSpan.FromMinutes(15);

    /// <summary>Kodu üretip <paramref name="email"/> adresine gönderir. ChangeEmail'de adres yeni e-postadır.</summary>
    public async Task<Result> SendAsync(AppUser user, EmailCodePurpose purpose, string email, CancellationToken ct)
    {
        var throttleKey = Key("sent", user, purpose);
        if (await cache.GetStringAsync(throttleKey, ct) is not null)
        {
            return AuthErrors.CodeThrottled();
        }

        var code = purpose switch
        {
            EmailCodePurpose.ConfirmEmail => await users.GenerateEmailConfirmationTokenAsync(user),
            EmailCodePurpose.ResetPassword => await users.GeneratePasswordResetTokenAsync(user),
            EmailCodePurpose.ChangeEmail => await users.GenerateChangeEmailTokenAsync(user, email),
            _ => throw new ArgumentOutOfRangeException(nameof(purpose)),
        };

        await cache.SetStringAsync(throttleKey, "1", new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ResendInterval }, ct);
        await cache.RemoveAsync(Key("attempts", user, purpose), ct); // yeni kod → deneme hakkı sıfırlanır
        await sender.SendCodeAsync(email, purpose, code, ct);
        return Result.Success();
    }

    /// <summary>
    /// Kodu doğrular ve amaca göre işlemi uygular (e-postayı onayla / şifreyi değiştir / e-postayı değiştir).
    /// Şifre kurallarına uymayan yeni şifre gibi Identity hataları <c>identityErrors</c> ile döner.
    /// </summary>
    public async Task<(Result Result, IEnumerable<IdentityError> IdentityErrors)> VerifyAsync(
        AppUser user, EmailCodePurpose purpose, string code, string? value, CancellationToken ct)
    {
        var attemptsKey = Key("attempts", user, purpose);
        var attempts = int.TryParse(await cache.GetStringAsync(attemptsKey, ct), out var n) ? n : 0;
        if (attempts >= MaxAttempts)
        {
            return (AuthErrors.TooManyAttempts(), []);
        }

        var identity = purpose switch
        {
            EmailCodePurpose.ConfirmEmail => await users.ConfirmEmailAsync(user, code),
            EmailCodePurpose.ResetPassword => await users.ResetPasswordAsync(user, code, value!),
            EmailCodePurpose.ChangeEmail => await ChangeEmailAsync(user, value!, code),
            _ => throw new ArgumentOutOfRangeException(nameof(purpose)),
        };

        if (identity.Succeeded)
        {
            await cache.RemoveAsync(attemptsKey, ct);
            return (Result.Success(), []);
        }

        // Kod doğruysa ama başka bir kural (ör. şifre çok kısa) tutmadıysa deneme sayılmaz.
        if (identity.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.InvalidToken)))
        {
            await cache.SetStringAsync(attemptsKey, (attempts + 1).ToString(),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = AttemptWindow }, ct);
            return (AuthErrors.InvalidCode(), []);
        }

        return (Result.Success(), identity.Errors);
    }

    private async Task<IdentityResult> ChangeEmailAsync(AppUser user, string newEmail, string code)
    {
        var oldEmail = user.Email;
        var result = await users.ChangeEmailAsync(user, newEmail, code);

        // /auth/login kullanıcı adıyla arar; kullanıcı adı e-postaysa o da güncellenir.
        if (result.Succeeded && string.Equals(user.UserName, oldEmail, StringComparison.OrdinalIgnoreCase))
        {
            result = await users.SetUserNameAsync(user, newEmail);
        }

        return result;
    }

    private static string Key(string kind, AppUser user, EmailCodePurpose purpose) => $"auth:email-code:{kind}:{purpose}:{user.Id}";
}

/// <summary>Kullanıcıya e-posta gönderir. Gerçek gönderim (SMTP, Resend, SES…) için bu arayüzü uygulayın.</summary>
public interface IAppEmailSender
{
    Task SendCodeAsync(string email, EmailCodePurpose purpose, string code, CancellationToken ct);
}

/// <summary>Geliştirme için: e-posta göndermez, kodu log'a yazar (konsolda görünür).</summary>
internal sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IAppEmailSender
{
    public Task SendCodeAsync(string email, EmailCodePurpose purpose, string code, CancellationToken ct)
    {
        logger.LogInformation("E-posta kodu ({Purpose}) → {Email}: {Code}", purpose, email, code);
        return Task.CompletedTask;
    }
}

/// <summary>
/// Identity'nin link tabanlı e-postalarını (kayıttan sonra otomatik giden doğrulama linki gibi) bastırır.
/// Bu projede tüm e-posta işlemleri 6 haneli kodla, <see cref="EmailCodes"/> üzerinden yapılır.
/// </summary>
internal sealed class NoLinkEmailSender : IEmailSender<AppUser>
{
    public Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink) => Task.CompletedTask;
    public Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink) => Task.CompletedTask;
    public Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode) => Task.CompletedTask;
}
