using Ako.Api.Features.Auth;
using Ako.Api.Features.Products;
using Ako.Api.Features.Todos;
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

// Proxy arkasında gerçek istemci IP'si (rate limiting ve loglar için). İlk sırada olmalı.
app.UseForwardedHeaders();

// Her istek için tek satırlık özet log (yöntem, adres, durum kodu, süre).
app.UseSerilogRequestLogging();

// Sonraki her şey (hata yanıtları dahil) isteğin dilinde üretilir.
app.UseRequestLocalization();

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
app.MapTodos();
app.MapProducts();

// Backoffice adresleri: yalnızca Api:EnableAdminEndpoints=true olan (iç ağdaki) örnekte oluşur.
if (AdminEndpoints.IsEnabled(app.Configuration))
{
    app.MapAdmin(admin => admin.MapAuthAdmin()); // ako:auth
}

app.Run();

// Entegrasyon testlerinde WebApplicationFactory<Program> için gerekli.
public partial class Program;
