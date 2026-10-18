using Ako.Api.Common;

namespace Ako.Api.Features.Auth;

// Kod istemciye "code" alanında gider; metni Resources/Messages*.resx'te.
// Tarayıcı akışında (redirect) aynı kodlar returnUrl'e ?error=<kod> olarak eklenir.
internal static class AuthErrors
{
    public static Error ProviderUnavailable(string provider) => Error.NotFound("auth.provider_unavailable", provider);
    public static Error InvalidReturnUrl() => Error.Failure("auth.invalid_return_url");
    public static Error InvalidCode() => Error.Failure("auth.invalid_code");
    public static Error InvalidIdToken() => Error.Failure("auth.invalid_id_token");
    public static Error EmailInUse() => Error.Conflict("auth.email_in_use");
    public static Error UserCreationFailed() => Error.Failure("auth.user_creation_failed");
    public static Error CodeThrottled() => Error.TooManyRequests("auth.code_throttled");
    public static Error TooManyAttempts() => Error.TooManyRequests("auth.too_many_attempts");
    public static Error UseEmailChangeEndpoint() => Error.Failure("auth.use_email_change");
}
