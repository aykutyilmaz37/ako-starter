using Ako.Api.Features.Auth; // ako:auth
using Ako.Api.Features.Localization; // ako:lang
using Ako.Api.Features.Products; // ako:sample
using Ako.Api.Features.Todos; // ako:todos
using Ako.Api.Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.AddObservability(); // Serilog + OpenTelemetry

builder.Services.AddAppOpenApi();
builder.Services.AddAppLocalization(); // ProblemDetails dahil
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddFeatures();
builder.Services.AddAuth(builder.Configuration); // ako:auth
builder.Services.AddAppRateLimiting(builder.Configuration);
builder.Services.AddAppForwardedHeaders(builder.Configuration);
builder.Services.AddAppHealthChecks(builder.Configuration);

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddHostedService<DevDataInitializer>(); // migration + admin hesabı
}

var app = builder.Build();

// Deploy adımı: "dotnet Ako.Api.dll migrate" veritabanını hazırlar ve çıkar; sunucu açılmaz (bkz. DatabaseMigrator).
if (args.Contains("migrate"))
{
    await DatabaseMigrator.RunAsync(app.Services);
    return;
}

// Proxy arkasında gerçek istemci IP'si (rate limiting ve loglar için). İlk sırada olmalı.
app.UseForwardedHeaders();

// Her istek için tek satırlık özet log (yöntem, adres, durum kodu, süre).
app.UseSerilogRequestLogging();

// Sonraki her şey (hata yanıtları dahil) isteğin dilinde üretilir.
app.UseRequestLocalization();

// ako:begin sample
// wwwroot: ürün görselleri (/images/...). Web'de BFF üzerinden /api/images/... olarak gelir.
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx => ctx.Context.Response.Headers.CacheControl = "public, max-age=86400",
});
// ako:end sample

// Yakalanmayan hatalar ve boş 4xx/5xx yanıtlar ProblemDetails olarak döner.
app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseAuth(); // ako:auth — kimlik doğrulama + yetkilendirme
app.UseRateLimiter();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // /openapi/v1.json: canlı şema

    // /swagger: dokümantasyon ve deneme arayüzü. Şemayı üretmez, yukarıdaki /openapi/v1.json'u gösterir.
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Ako.Api v1");
        options.EnablePersistAuthorization(); // girilen token sayfa yenilenince kaybolmasın
    });
}

app.MapAppHealthChecks(); // /health/live, /health/ready
app.MapAuth(); // ako:auth
app.MapTodos(); // ako:todos
app.MapProducts(); // ako:sample
app.MapLocalization(); // ako:lang

// ako:begin auth
// Backoffice adresleri: yalnızca Api:EnableAdminEndpoints=true olan (iç ağdaki) örnekte oluşur.
if (AdminEndpoints.IsEnabled(app.Configuration))
{
    app.MapAdmin(admin =>
    {
        admin.MapAuthAdmin(); // ako:auth
        admin.MapProductsAdmin(); // ako:sample
        admin.MapLocalizationAdmin(); // ako:lang
    });
}
// ako:end auth

app.Run();

// Entegrasyon testlerinde WebApplicationFactory<Program> için gerekli.
public partial class Program;
