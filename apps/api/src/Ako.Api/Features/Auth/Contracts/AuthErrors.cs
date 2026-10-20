using Ako.Api.Common;

namespace Ako.Api.Features.Auth;

// Kod istemciye "code" alanında gider; metni Resources/Localization/Messages*.resx'te.
// Tarayıcı akışında (redirect) aynı kodlar returnUrl'e ?error=<kod> olarak eklenir.
internal static class AuthErrors
{
    public static Error ProviderUnavailable(string provider) => Error.NotFound("auth.provider_unavailable", provider); // ako:social
    public static Error InvalidReturnUrl() => Error.Failure("auth.invalid_return_url"); // ako:social
    public static Error InvalidCode() => Error.Failure("auth.invalid_code");
    public static Error InvalidGuestToken() => Error.Failure("auth.invalid_guest_token"); // ako:guest
    public static Error InvalidIdToken() => Error.Failure("auth.invalid_id_token"); // ako:social
    public static Error EmailInUse() => Error.Conflict("auth.email_in_use");
    public static Error UserCreationFailed() => Error.Failure("auth.user_creation_failed");
    public static Error CodeThrottled() => Error.TooManyRequests("auth.code_throttled");
    public static Error TooManyAttempts() => Error.TooManyRequests("auth.too_many_attempts");
    public static Error UseEmailChangeEndpoint() => Error.Failure("auth.use_email_change");
    public static Error UserNotFound(Guid id) => Error.NotFound("auth.user_not_found", id);
    public static Error CannotRemoveOwnAdmin() => Error.Failure("auth.cannot_remove_own_admin");
}
