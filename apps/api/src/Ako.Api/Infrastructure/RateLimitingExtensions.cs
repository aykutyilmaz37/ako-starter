using System.Threading.RateLimiting;
using Ako.Api.Common;
using Microsoft.AspNetCore.RateLimiting;

namespace Ako.Api.Infrastructure;

/// <summary>Endpoint'lerde RequireRateLimiting(AppRateLimits.X) ile kullanılan sınır politikaları.</summary>
public static class AppRateLimits
{
    /// <summary>
    /// Kayıt, giriş, kod gönderme gibi kötüye kullanılabilecek istekler: IP başına dakikada
    /// "RateLimiting:Auth:PermitLimit" (varsayılan 10) POST. GET istekleri sınırlanmaz.
    /// </summary>
    public const string Auth = "auth";
}

public static class RateLimitingExtensions
{
    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var authLimit = configuration.GetValue("RateLimiting:Auth:PermitLimit", 10);

        return services.AddRateLimiter(options =>
        {
            options.AddPolicy(AppRateLimits.Auth, context =>
                HttpMethods.IsGet(context.Request.Method)
                    ? RateLimitPartition.GetNoLimiter("get")
                    // Bir reverse proxy arkasında gerçek IP için ForwardedHeaders ayarlanmalı (bkz. README).
                    : RateLimitPartition.GetFixedWindowLimiter(
                        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                        _ => new FixedWindowRateLimiterOptions { PermitLimit = authLimit, Window = TimeSpan.FromMinutes(1) }));

            // Reddedilen istek: 429 + Retry-After + diğer hatalarla aynı biçimde ProblemDetails (code: "rate_limited").
            options.OnRejected = async (context, _) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
                }

                await Error.TooManyRequests("rate_limited").ToProblem().ExecuteAsync(context.HttpContext);
            };
        });
    }
}
