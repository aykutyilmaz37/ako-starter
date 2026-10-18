using Npgsql;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Formatting.Compact;

namespace Ako.Api.Infrastructure;

/// <summary>
/// Loglama (Serilog) ve izleme (OpenTelemetry).
/// - Loglar: geliştirmede okunaklı konsol, diğer ortamlarda tek satır JSON (log toplayıcılar okur).
///   Seviyeler "Serilog" ayar bölümünden gelir. Her log, isteğin TraceId'sini taşır.
/// - Trace ve metrik: gelen istekler, giden HTTP çağrıları, SQL sorguları, runtime metrikleri.
/// - "OTEL_EXPORTER_OTLP_ENDPOINT" doluysa loglar, trace'ler ve metrikler oraya gönderilir
///   (Aspire Dashboard, Grafana, Datadog, Seq… OTLP destekleyen her araç). Boşsa yalnızca konsola log yazılır.
/// </summary>
public static class ObservabilityExtensions
{
    public static WebApplicationBuilder AddObservability(this WebApplicationBuilder builder)
    {
        var serviceName = builder.Configuration["OTEL_SERVICE_NAME"] ?? "ako-api";
        var otlpEndpoint = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];

        builder.Services.AddSerilog((services, logger) =>
        {
            logger.ReadFrom.Configuration(builder.Configuration)
                .ReadFrom.Services(services)
                .Enrich.FromLogContext();

            if (builder.Environment.IsDevelopment())
            {
                logger.WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}");
            }
            else
            {
                logger.WriteTo.Console(new RenderedCompactJsonFormatter());
            }

            if (!string.IsNullOrWhiteSpace(otlpEndpoint))
            {
                logger.WriteTo.OpenTelemetry(options =>
                {
                    options.Endpoint = otlpEndpoint;
                    options.ResourceAttributes["service.name"] = serviceName;
                });
            }
        });

        var telemetry = builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(serviceName))
            .WithTracing(tracing => tracing
                .AddAspNetCoreInstrumentation(options =>
                    options.Filter = context => !context.Request.Path.StartsWithSegments("/health")) // sağlık sorguları gürültü yapmasın
                .AddHttpClientInstrumentation()
                .AddNpgsql())
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation());

        if (!string.IsNullOrWhiteSpace(otlpEndpoint))
        {
            telemetry.UseOtlpExporter();
        }

        return builder;
    }
}
