using System.Reflection;
using Ako.Api.Common;

namespace Ako.Api.Infrastructure;

/// <summary>
/// Backoffice'in kullandığı /admin/... adresleri. Aynı API kodu iki şekilde deploy edilir:
///   internete açık örnek → Api:EnableAdminEndpoints=false (varsayılan): /admin adresleri hiç oluşmaz
///   iç ağ / VPN örneği   → Api:EnableAdminEndpoints=true
/// Açık olduğunda da tüm grup Admin rolü ister (ikinci katman).
/// </summary>
public static class AdminEndpoints
{
    public static bool IsEnabled(IConfiguration configuration) =>
        configuration.GetValue("Api:EnableAdminEndpoints", false) || IsGeneratingOpenApiDocument();

    /// <param name="map">Özelliklerin admin endpoint'lerini ekleyen çağrılar, ör. admin => admin.MapAuthAdmin().</param>
    public static IEndpointRouteBuilder MapAdmin(this IEndpointRouteBuilder app, Action<RouteGroupBuilder> map)
    {
        var group = app.MapGroup("/admin").RequireAuthorization(AppPolicies.Admin);
        map(group);
        return app;
    }

    // Build sırasında openapi.json üretilirken admin adresleri her zaman şemaya girer;
    // böylece api-client'ta backoffice'in hook'ları bulunur. Çalışan uygulamada etkisi yoktur.
    private static bool IsGeneratingOpenApiDocument() =>
        Assembly.GetEntryAssembly()?.GetName().Name == "GetDocument.Insider";
}
