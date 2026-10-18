using Ako.Api.Common;
using Ako.Api.Infrastructure.Data;
using FluentValidation;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AuditInterceptor>();

        // Token/çerez şifreleme anahtarları veritabanında (varsayılanı container içi klasördür, yeniden başlayınca silinir).
        // Bağlantı yoksa (ör. build sırasında openapi.json üretilirken) veritabanına gidilmez.
        var dataProtection = services.AddDataProtection().SetApplicationName("ako-api");
        if (!string.IsNullOrWhiteSpace(configuration.GetConnectionString("Default")))
        {
            dataProtection.PersistKeysToDbContext<AppDbContext>();
        }

        // Bağlantı ilk sorguda açılır; build sırasında openapi.json üretilirken veritabanı gerekmez.
        return services.AddDbContext<AppDbContext>((sp, options) =>
            options
                .UseNpgsql(configuration.GetConnectionString("Default"))
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(sp.GetRequiredService<AuditInterceptor>()));
    }

    /// <summary>
    /// Validator'ları ve adı "Handler" ile biten sınıfları kaydeder.
    /// Yeni bir use case için ayrıca kayıt yazmak gerekmez.
    /// </summary>
    public static IServiceCollection AddFeatures(this IServiceCollection services)
    {
        var assembly = typeof(ServiceCollectionExtensions).Assembly;

        services.AddValidatorsFromAssembly(assembly, includeInternalTypes: true);

        var handlers = assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false } && t.Name.EndsWith("Handler", StringComparison.Ordinal));
        foreach (var handler in handlers)
        {
            services.AddScoped(handler);
        }

        services.AddSingleton(TimeProvider.System);
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();

        return services;
    }
}
