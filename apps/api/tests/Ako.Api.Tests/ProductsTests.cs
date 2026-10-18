using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Ako.Api.Common;
using Ako.Api.Features.Products;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class ProductsTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();

    // Testler aynı veritabanını paylaştığı için her test kendi benzersiz SKU'sunu kullanır.
    private static string NewSku() => $"T-{Guid.NewGuid():N}"[..20];

    [Fact]
    public async Task Crud_akisi_bastan_sona_calisir()
    {
        var sku = NewSku();

        var create = await _client.PostAsJsonAsync("/products", new CreateProductRequest(sku, "Kalem", null, 12.50m, 3));
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = (await create.Content.ReadFromJsonAsync<ProductResponse>())!;
        Assert.Equal(sku.ToUpperInvariant(), created.Sku);

        var get = await _client.GetFromJsonAsync<ProductResponse>($"/products/{created.Id}");
        Assert.Equal("Kalem", get!.Name);

        var update = await _client.PutAsJsonAsync($"/products/{created.Id}", new UpdateProductRequest("Kurşun kalem", "HB", 15m, 10));
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(15m, (await update.Content.ReadFromJsonAsync<ProductResponse>())!.Price);

        var delete = await _client.DeleteAsync($"/products/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var afterDelete = await _client.GetAsync($"/products/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, afterDelete.StatusCode);
    }

    [Fact]
    public async Task Ayni_sku_ikinci_kez_eklenirse_409_ve_hata_kodu_doner()
    {
        var sku = NewSku();
        await _client.PostAsJsonAsync("/products", new CreateProductRequest(sku, "A", null, 1m, 0));

        var response = await _client.PostAsJsonAsync("/products", new CreateProductRequest(sku.ToLowerInvariant(), "B", null, 1m, 0));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.Equal("products.sku_taken", ((JsonElement)problem!.Extensions["code"]!).GetString());
    }

    [Fact]
    public async Task Gecersiz_istek_alan_bazli_hatalar_doner_ve_dile_gore_cevrilir()
    {
        var body = new CreateProductRequest("ab c", "", null, 0m, -1);

        var tr = await Send(body, "tr");
        Assert.Equal("SKU yalnızca harf, rakam ve tire içerebilir.", tr.Errors["sku"].Single());
        Assert.Contains("'Fiyat'", tr.Errors["price"].Single());
        Assert.Equal(["sku", "name", "price", "stock"], tr.Errors.Keys);

        var en = await Send(body, "en-US");
        Assert.Contains("'Price'", en.Errors["price"].Single());

        async Task<HttpValidationProblemDetails> Send(CreateProductRequest request, string language)
        {
            using var message = new HttpRequestMessage(HttpMethod.Post, "/products") { Content = JsonContent.Create(request) };
            message.Headers.AcceptLanguage.ParseAdd(language);
            var response = await _client.SendAsync(message);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            return (await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>())!;
        }
    }

    [Fact]
    public async Task Liste_arama_ve_sayfalama_yapar()
    {
        var tag = Guid.NewGuid().ToString("N")[..8];
        foreach (var i in Enumerable.Range(1, 3))
        {
            await _client.PostAsJsonAsync("/products", new CreateProductRequest(NewSku(), $"Defter {tag} {i}", null, 5m, 1));
        }

        var page = await _client.GetFromJsonAsync<PagedResponse<ProductResponse>>($"/products?search={tag}&pageSize=2&page=2");

        Assert.Equal(3, page!.TotalCount);
        Assert.Equal(2, page.TotalPages);
        Assert.Equal($"Defter {tag} 3", page.Items.Single().Name);
    }

    [Fact]
    public async Task Gecersiz_sayfa_boyutu_400_doner()
    {
        var response = await _client.GetAsync($"/products?pageSize={Paging.MaxPageSize + 1}");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
