using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

/// <summary>
/// Desteklenen sosyal giriş sağlayıcıları. Her satır bir sağlayıcıdır; create-ako-app seçilmeyen
/// satırları (ve paketlerini) siler. Bir sağlayıcı yalnızca "Auth:Providers:&lt;Ad&gt;:ClientId"
/// ayarı doluysa etkinleşir; boşsa endpoint'i yoktur ve /auth/providers listesinde görünmez.
/// </summary>
public static class ExternalProviders
{
    /// <param name="Slug">URL'deki adı: /auth/external/{slug}.</param>
    /// <param name="Scheme">ASP.NET Core'daki şema adı; user_logins tablosunda da bu ad tutulur.</param>
    /// <param name="TrustsEmail">
    /// Sağlayıcı e-postayı doğrulanmış olarak veriyorsa true. Yalnızca o zaman aynı e-postalı
    /// mevcut hesaba otomatik bağlanır; aksi hâlde başkasının hesabını ele geçirme riski olur.
    /// </param>
    public sealed record Provider(
        string Slug,
        string Scheme,
        bool TrustsEmail,
        Action<AuthenticationBuilder, IConfigurationSection> Register);

    public static readonly Provider[] All =
    [
        new("google", "Google", TrustsEmail: true, (auth, c) => auth.AddGoogle("Google", o => Bind(o, c))),
        new("facebook", "Facebook", TrustsEmail: false, (auth, c) => auth.AddFacebook("Facebook", o => Bind(o, c))),
        new("github", "GitHub", TrustsEmail: false, (auth, c) => auth.AddGitHub("GitHub", o =>
        {
            Bind(o, c);
            o.Scope.Add("user:email");
        })),
        // X'in OAuth 2.0 API'si e-posta vermez; kullanıcı e-postasız oluşturulur.
        new("x", "Twitter", TrustsEmail: false, (auth, c) => auth.AddTwitter("Twitter", o => Bind(o, c))),
        new("linkedin", "LinkedIn", TrustsEmail: false, (auth, c) => auth.AddLinkedIn("LinkedIn", o => Bind(o, c))),
        // Apple callback'i form POST olarak gelir; tarayıcı çerezi gönderebilsin diye HTTPS gerekir.
        new("apple", "Apple", TrustsEmail: true, (auth, c) => auth.AddApple("Apple", o =>
        {
            o.ClientId = c["ClientId"]!;
            o.TeamId = c["TeamId"]!;
            o.KeyId = c["KeyId"]!;
            o.GenerateClientSecret = true;
            o.PrivateKey = (_, _) => Task.FromResult(c["PrivateKey"]!.AsMemory());
            o.SignInScheme = IdentityConstants.ExternalScheme;
        })),
    ];

    public static bool IsConfigured(IConfiguration configuration, Provider provider) =>
        !string.IsNullOrWhiteSpace(configuration[$"Auth:Providers:{provider.Scheme}:ClientId"]);

    public static Provider? Find(string slug) =>
        All.FirstOrDefault(p => string.Equals(p.Slug, slug, StringComparison.OrdinalIgnoreCase));

    private static void Bind(Microsoft.AspNetCore.Authentication.OAuth.OAuthOptions options, IConfigurationSection c)
    {
        options.ClientId = c["ClientId"]!;
        options.ClientSecret = c["ClientSecret"]!;
        options.SignInScheme = IdentityConstants.ExternalScheme;
    }
}
