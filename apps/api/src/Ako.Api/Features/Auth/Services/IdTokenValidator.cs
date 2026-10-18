using System.Collections.Concurrent;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace Ako.Api.Features.Auth;

/// <summary>
/// Mobilde native Google/Apple girişinden gelen id token'ı doğrular: imza (sağlayıcının yayınladığı
/// anahtarlarla), yayıncı, hedef kitle (bizim client id'lerimiz) ve süre. Anahtarlar önbelleğe alınır.
/// Hedef kitle "Auth:Providers:&lt;Ad&gt;:NativeClientIds" ayarından gelir; boşsa native giriş kapalıdır.
/// </summary>
public sealed class IdTokenValidator(IConfiguration configuration)
{
    private static readonly Dictionary<string, (string Metadata, string[] Issuers)> Issuers = new()
    {
        ["Google"] = ("https://accounts.google.com/.well-known/openid-configuration", ["https://accounts.google.com", "accounts.google.com"]),
        ["Apple"] = ("https://appleid.apple.com/.well-known/openid-configuration", ["https://appleid.apple.com"]),
    };

    private static readonly ConcurrentDictionary<string, ConfigurationManager<OpenIdConnectConfiguration>> Configs = new();

    public static IEnumerable<string> SupportedSchemes => Issuers.Keys;

    public string[] AudiencesFor(string scheme) =>
        configuration.GetSection($"Auth:Providers:{scheme}:NativeClientIds").Get<string[]>() ?? [];

    /// <summary>Geçerliyse (sub, e-posta) döner; e-posta doğrulanmamışsa null gelir.</summary>
    public async Task<(string Subject, string? Email)?> ValidateAsync(string scheme, string idToken, CancellationToken ct)
    {
        var audiences = AudiencesFor(scheme);
        if (audiences.Length == 0 || !Issuers.TryGetValue(scheme, out var issuer))
        {
            return null;
        }

        var manager = Configs.GetOrAdd(scheme, _ => new ConfigurationManager<OpenIdConnectConfiguration>(
            issuer.Metadata, new OpenIdConnectConfigurationRetriever(), new HttpDocumentRetriever()));
        var oidc = await manager.GetConfigurationAsync(ct);

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(idToken, new TokenValidationParameters
        {
            ValidIssuers = issuer.Issuers,
            ValidAudiences = audiences,
            IssuerSigningKeys = oidc.SigningKeys,
        });

        if (!result.IsValid || result.SecurityToken is not JsonWebToken jwt)
        {
            return null;
        }

        var emailVerified = jwt.TryGetPayloadValue<object>("email_verified", out var v)
            && string.Equals(v?.ToString(), "true", StringComparison.OrdinalIgnoreCase);
        var email = emailVerified && jwt.TryGetPayloadValue<string>("email", out var e) ? e : null;

        return (jwt.Subject, email);
    }
}
