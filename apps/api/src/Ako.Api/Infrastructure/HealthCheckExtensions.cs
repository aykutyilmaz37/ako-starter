using System.Net.Sockets;
using System.Text.Json;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Ako.Api.Infrastructure;

/// <summary>
/// Sağlık kontrolleri (Docker, Kubernetes, load balancer bunları sorar):
///   GET /health/live  → süreç ayakta mı? Hiçbir bağımlılığa bakmaz; başarısızsa container yeniden başlatılır.
///   GET /health/ready → veritabanı ve SMTP erişilebilir mi? Başarısızsa trafik bu örneğe yönlendirilmez.
/// </summary>
public static class HealthCheckExtensions
{
    private const string Ready = "ready";

    public static IServiceCollection AddAppHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var checks = services.AddHealthChecks()
            .AddDbContextCheck<AppDbContext>("database", tags: [Ready]);

        if (!string.IsNullOrWhiteSpace(configuration["Email:Smtp:Host"]))
        {
            checks.AddCheck<SmtpHealthCheck>("smtp", HealthStatus.Degraded, tags: [Ready]); // mail gitmese de API çalışır
        }

        return services;
    }

    public static IEndpointRouteBuilder MapAppHealthChecks(this IEndpointRouteBuilder app)
    {
        app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false })
            .DisableRateLimiting();
        app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = c => c.Tags.Contains(Ready), ResponseWriter = WriteJson })
            .DisableRateLimiting();
        return app;
    }

    /// <summary>{ "status": "Healthy", "checks": { "database": "Healthy", "smtp": "Degraded" } }</summary>
    private static Task WriteJson(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.ToDictionary(e => e.Key, e => e.Value.Status.ToString()),
        }));
    }
}

/// <summary>SMTP sunucusuna TCP bağlantısı açılabiliyor mu? (Giriş yapmaz, mail göndermez.)</summary>
internal sealed class SmtpHealthCheck(IConfiguration configuration) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            using var client = new TcpClient();
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(ct);
            timeout.CancelAfter(TimeSpan.FromSeconds(3));
            await client.ConnectAsync(configuration["Email:Smtp:Host"]!, configuration.GetValue("Email:Smtp:Port", 587), timeout.Token);
            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(context.Registration.FailureStatus, "SMTP sunucusuna bağlanılamadı.", ex);
        }
    }
}
