using Ako.Api.Resources;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

/// <summary>
/// Identity'nin hata mesajlarını (şifre kuralları, e-posta kullanımda…) isteğin diline çevirir.
/// Metinler Resources/Messages*.resx'te "identity.&lt;Kod&gt;" anahtarlarıyla durur.
/// </summary>
internal sealed class LocalizedIdentityErrorDescriber : IdentityErrorDescriber
{
    private static IdentityError E(string code, params object?[] args) =>
        new() { Code = code, Description = Messages.Get($"identity.{code}", args) };

    public override IdentityError DuplicateEmail(string email) => E(nameof(DuplicateEmail), email);
    public override IdentityError DuplicateUserName(string userName) => E(nameof(DuplicateUserName), userName);
    public override IdentityError InvalidEmail(string? email) => E(nameof(InvalidEmail), email);
    public override IdentityError InvalidUserName(string? userName) => E(nameof(InvalidUserName), userName);
    public override IdentityError InvalidToken() => E(nameof(InvalidToken));
    public override IdentityError PasswordMismatch() => E(nameof(PasswordMismatch));
    public override IdentityError PasswordTooShort(int length) => E(nameof(PasswordTooShort), length);
    public override IdentityError PasswordRequiresDigit() => E(nameof(PasswordRequiresDigit));
    public override IdentityError PasswordRequiresLower() => E(nameof(PasswordRequiresLower));
    public override IdentityError PasswordRequiresUpper() => E(nameof(PasswordRequiresUpper));
    public override IdentityError PasswordRequiresNonAlphanumeric() => E(nameof(PasswordRequiresNonAlphanumeric));
    public override IdentityError PasswordRequiresUniqueChars(int uniqueChars) => E(nameof(PasswordRequiresUniqueChars), uniqueChars);
    public override IdentityError LoginAlreadyAssociated() => E(nameof(LoginAlreadyAssociated));
}

/// <summary>
/// Doğrulama ve şifre sıfırlama e-postaları. Şimdilik yalnızca log'a yazar (bağlantılar konsolda görünür).
/// Gerçek gönderim için bu sınıfı SMTP ya da bir e-posta servisiyle değiştirin.
/// </summary>
internal sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender<AppUser>
{
    public Task SendConfirmationLinkAsync(AppUser user, string email, string confirmationLink) =>
        Log(email, "doğrulama bağlantısı", confirmationLink);

    public Task SendPasswordResetLinkAsync(AppUser user, string email, string resetLink) =>
        Log(email, "şifre sıfırlama bağlantısı", resetLink);

    public Task SendPasswordResetCodeAsync(AppUser user, string email, string resetCode) =>
        Log(email, "şifre sıfırlama kodu", resetCode);

    private Task Log(string email, string kind, string value)
    {
        logger.LogInformation("E-posta ({Kind}) → {Email}: {Value}", kind, email, value);
        return Task.CompletedTask;
    }
}
