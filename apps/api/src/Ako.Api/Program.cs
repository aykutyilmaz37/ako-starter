using Ako.Api.Features.Products;
using Ako.Api.Features.Todos;
using Ako.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddAppLocalization(); // ProblemDetails dahil
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddFeatures();

var app = builder.Build();

// İlk sırada: sonraki her şey (hata yanıtları dahil) isteğin dilinde üretilir.
app.UseRequestLocalization();

// Yakalanmayan hatalar ve boş 4xx/5xx yanıtlar ProblemDetails olarak döner.
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // /openapi/v1.json: canlı şema

    // /swagger: dokümantasyon ve deneme arayüzü. Şemayı üretmez, yukarıdaki /openapi/v1.json'u gösterir.
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Ako.Api v1"));
}

app.MapGet("/health", () => TypedResults.Ok()).ExcludeFromDescription();
app.MapTodos();
app.MapProducts();

app.Run();

// Entegrasyon testlerinde WebApplicationFactory<Program> için gerekli.
public partial class Program;
