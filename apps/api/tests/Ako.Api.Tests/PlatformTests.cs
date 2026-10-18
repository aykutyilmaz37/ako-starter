using System.Net;
using System.Net.Http.Json;
using Ako.Api.Features.Products;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class PlatformTests(ApiFactory factory)
{
    [Fact]
    public async Task Health_live_ve_ready_200_doner()
    {
        var client = factory.CreateClient();

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live")).StatusCode);
        var ready = await client.GetAsync("/health/ready");
        Assert.Equal(HttpStatusCode.OK, ready.StatusCode);
        Assert.Contains("\"database\":\"Healthy\"", await ready.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Denetim_alanlari_otomatik_dolar()
    {
        var admin = await factory.CreateAdminClientAsync();
        var me = await admin.GetFromJsonAsync<Ako.Api.Features.Auth.MeResponse>("/auth/me");
        var create = await admin.PostAsJsonAsync("/admin/products", new CreateProductRequest($"A-{Guid.NewGuid():N}"[..20], "A", null, ProductCategory.Coffee, null, 1m, 1));
        var created = (await create.Content.ReadFromJsonAsync<ProductResponse>())!;
        await admin.PutAsJsonAsync($"/admin/products/{created.Id}", new UpdateProductRequest("B", null, ProductCategory.Coffee, null, 2m, 2));

        using var scope = factory.Services.CreateScope();
        var product = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Products.AsNoTracking().SingleAsync(p => p.Id == created.Id);

        Assert.Equal(me!.Id, product.CreatedBy);
        Assert.Equal(me.Id, product.UpdatedBy);
        Assert.True(product.UpdatedAt > product.CreatedAt);
    }

    [Fact]
    public async Task Auth_POST_istekleri_sinirlanir_GET_ler_sinirlanmaz()
    {
        // Sınırı 2'ye düşürülmüş ayrı bir uygulama örneği (aynı veritabanı).
        using var limited = factory.WithWebHostBuilder(b => b.UseSetting("RateLimiting:Auth:PermitLimit", "2"));
        var client = limited.CreateClient();
        var body = new { email = "yok@test.local", password = "x" };

        await client.PostAsJsonAsync("/auth/login", body);
        await client.PostAsJsonAsync("/auth/login", body);
        var third = await client.PostAsJsonAsync("/auth/login", body);

        Assert.Equal(HttpStatusCode.TooManyRequests, third.StatusCode);
        Assert.True(third.Headers.Contains("Retry-After"));
        Assert.Contains("rate_limited", await third.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/auth/providers")).StatusCode);
    }
}
