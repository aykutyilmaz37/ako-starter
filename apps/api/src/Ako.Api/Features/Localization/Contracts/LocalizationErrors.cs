using Ako.Api.Common;

namespace Ako.Api.Features.Localization;

// Kod istemciye "code" alanında gider; metni Resources/Localization/Messages*.resx'te

internal static class LocalizationErrors
{
    public static Error LanguageNotFound(string code) => Error.NotFound("localization.language_not_found", code);

    public static Error LanguageExists(string code) => Error.Conflict("localization.language_exists", code);

    public static Error LanguageIsDefault(string code) => Error.Conflict("localization.language_is_default", code);

    public static Error NamespaceNotFound(string @namespace) => Error.NotFound("localization.namespace_not_found", @namespace);

    public static Error KeyNotFound(string key) => Error.NotFound("localization.key_not_found", key);
}
