using Ako.Api.Common;
using Microsoft.AspNetCore.Identity;

namespace Ako.Api.Features.Auth;

/// <summary>Auth özelliğinin tüm servis kayıtları. Program.cs yalnızca AddAuth() çağırır.</summary>
public static class AuthSetup
{
    public static IServiceCollection AddAuth(this IServiceCollection services, IConfiguration configuration)
    {
        // Identity: kullanıcı/rol yönetimi + bearer token (access + refresh) + hazır endpoint'ler (MapIdentityApi).
        services
            .AddIdentityApiEndpoints<AppUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = false; // e-postasız sosyal hesaplar (X) için; tekillik kullanıcı adıyla sağlanır
                options.SignIn.RequireConfirmedAccount = false; // e-posta doğrulaması zorunlu olsun isterseniz true yapın
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<Infrastructure.Data.AppDbContext>()
            .AddErrorDescriber<LocalizedIdentityErrorDescriber>();

        services.AddAuthorizationBuilder()
            .AddPolicy(AppPolicies.Admin, policy => policy.RequireRole(AppRoles.Admin));

        // Sosyal giriş sağlayıcıları: yalnızca ayarı dolu olanlar kaydedilir.
        var authentication = services.AddAuthentication();
        foreach (var provider in ExternalProviders.All.Where(p => ExternalProviders.IsConfigured(configuration, p)))
        {
            provider.Register(authentication, configuration.GetSection($"Auth:Providers:{provider.Scheme}"));
        }

        services.AddDistributedMemoryCache();
        services.AddSingleton<LoginCodeStore>();
        services.AddSingleton<IdTokenValidator>();
        services.AddScoped<ExternalUserResolver>();
        services.AddTransient<IEmailSender<AppUser>, LoggingEmailSender>();

        return services;
    }

    /// <summary>
    /// Sosyal giriş sonunda yönlendirilmesine izin verilen adresler (açık yönlendirme açığına karşı).
    /// Ör. "http://localhost:5173/auth/callback", "ako://auth/callback".
    /// </summary>
    public static bool IsAllowedReturnUrl(IConfiguration configuration, string? returnUrl) =>
        Uri.TryCreate(returnUrl, UriKind.Absolute, out _)
        && (configuration.GetSection("Auth:AllowedReturnUrls").Get<string[]>() ?? [])
            .Any(allowed => returnUrl.StartsWith(allowed, StringComparison.OrdinalIgnoreCase));
}
