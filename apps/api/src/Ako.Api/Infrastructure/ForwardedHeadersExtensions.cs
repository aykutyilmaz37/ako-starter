using Microsoft.AspNetCore.HttpOverrides;

namespace Ako.Api.Infrastructure;

/// <summary>
/// API bir proxy (web BFF, Nginx, load balancer) arkasında çalışır. Gerçek istemci IP'si X-Forwarded-For
/// başlığından okunur; rate limiting ve loglar bu IP'yi kullanır. Başlığa YALNIZCA güvenilen proxy'lerden
/// inanılır, aksi hâlde herkes başlığı yazarak IP'sini değiştirebilirdi.
///   varsayılan: aynı makine (127.0.0.1, ::1)
///   "ForwardedHeaders:KnownNetworks": ["10.0.0.0/8", "172.16.0.0/12"] → Docker / iç ağ
/// </summary>
public static class ForwardedHeadersExtensions
{
    public static IServiceCollection AddAppForwardedHeaders(this IServiceCollection services, IConfiguration configuration) =>
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            foreach (var network in configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() ?? [])
            {
                options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
            }
        });
}
