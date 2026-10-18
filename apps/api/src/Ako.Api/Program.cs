using Ako.Api.Features.Auth;
using Ako.Api.Features.Products;
using Ako.Api.Features.Todos;
using Ako.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAppOpenApi();
builder.Services.AddAppLocalization(); // ProblemDetails dahil
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddFeatures();
builder.Services.AddAuth(builder.Configuration); // ako:auth

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddHostedService<DevDataInitializer>(); // migration + admin hesabı
}

var app = builder.Build();

// İlk sırada: sonraki her şey (hata yanıtları dahil) isteğin dilinde üretilir.
app.UseRequestLocalization();

// Yakalanmayan hatalar ve boş 4xx/5xx yanıtlar ProblemDetails olarak döner.
app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseAuth(); // ako:auth — kimlik doğrulama + yetkilendirme

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

app.MapGet("/health", () => TypedResults.Ok()).ExcludeFromDescription();
app.MapAuth(); // ako:auth
app.MapTodos();
app.MapProducts();

app.Run();

// Entegrasyon testlerinde WebApplicationFactory<Program> için gerekli.
public partial class Program;
