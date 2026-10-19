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
                // true: e-postasını 6 haneli kodla doğrulamayan kullanıcı e-posta + şifreyle giriş yapamaz.
                // Sosyal girişi etkilemez (kimliği sağlayıcı doğrular; X e-posta bile vermez).
                options.SignIn.RequireConfirmedEmail = configuration.GetValue<bool>("Auth:RequireConfirmedEmail");

                // E-posta doğrulama, şifre sıfırlama ve e-posta değişikliği aynı 6 haneli kod üreticisini kullanır.
                options.Tokens.EmailConfirmationTokenProvider = TokenOptions.DefaultEmailProvider;
                options.Tokens.PasswordResetTokenProvider = TokenOptions.DefaultEmailProvider;
                options.Tokens.ChangeEmailTokenProvider = TokenOptions.DefaultEmailProvider;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<Infrastructure.Data.AppDbContext>()
            .AddErrorDescriber<LocalizedIdentityErrorDescriber>();

        services.AddAuthorizationBuilder()
            .AddPolicy(AppPolicies.Admin, policy => policy.RequireRole(AppRoles.Admin))
            // Kayıtlı kullanıcı: giriş yapmış ve misafir değil (Admin de üyedir).
            .AddPolicy(AppPolicies.Member, policy => policy
                .RequireAuthenticatedUser()
                .RequireAssertion(context => !context.User.IsInRole(AppRoles.Guest)));

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
        services.AddScoped<GuestAccounts>();
        services.AddHostedService<GuestCleanupService>();
        services.AddScoped<EmailCodes>();
        // E-posta: "Email:Smtp:Host" doluysa SMTP ile gönderilir, boşsa kod yalnızca log'a yazılır.
        services.Configure<EmailOptions>(configuration.GetSection("Email"));
        if (string.IsNullOrWhiteSpace(configuration["Email:Smtp:Host"]))
        {
            services.AddTransient<IAppEmailSender, LoggingEmailSender>();
        }
        else
        {
            services.AddTransient<IAppEmailSender, SmtpEmailSender>();
        }
        services.AddTransient<IEmailSender<AppUser>, NoLinkEmailSender>();

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
