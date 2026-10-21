using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Ako.Api.Common;
using Ako.Api.Features.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class AuthTests(ApiFactory factory)
{
    [Fact]
    public async Task Kayit_olan_kullanici_User_rolu_alir_ve_me_ile_gorulur()
    {
        var email = $"me-{Guid.NewGuid():N}@test.local";
        var client = await factory.CreateUserClientAsync(email);

        var me = await client.GetFromJsonAsync<MeResponse>("/auth/me");

        Assert.Equal(email, me!.Email);
        Assert.Equal([AppRoles.User], me.Roles);
    }

    [Fact]
    public async Task Admin_hesabi_Admin_rolune_sahiptir()
    {
        var client = await factory.CreateAdminClientAsync();
        var me = await client.GetFromJsonAsync<MeResponse>("/auth/me");
        Assert.Contains(AppRoles.Admin, me!.Roles);
    }

    [Fact]
    public async Task Token_olmadan_me_401_doner()
    {
        var response = await factory.CreateClient().GetAsync("/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Zayif_sifre_turkce_hata_doner()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/auth/register",
            new { email = $"weak-{Guid.NewGuid():N}@test.local", password = "kisa" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        Assert.Contains("Şifre en az 8 karakter olmalı.", problem!.Errors.SelectMany(e => e.Value));
    }

    // ako:begin social
    [Fact]
    public async Task Ayar_yoksa_sosyal_saglayici_listesi_bostur()
    {
        var providers = await factory.CreateClient().GetFromJsonAsync<ProvidersResponse>("/auth/providers");
        Assert.Empty(providers!.External);
        Assert.Empty(providers.Native);
    }

    [Fact]
    public async Task Ayarlanmamis_saglayici_ile_giris_404_doner()
    {
        var response = await factory.CreateClient().GetAsync("/auth/external/github?returnUrl=http://localhost:5173/");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("auth.provider_unavailable", await CodeOf(response));
    }

    [Fact]
    public async Task Gecersiz_giris_kodu_400_doner()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/auth/exchange", new ExchangeCodeRequest("yok"));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("auth.invalid_code", await CodeOf(response));
    }

    [Fact]
    public async Task Giris_kodu_token_a_cevrilir_ve_bir_kez_kullanilabilir()
    {
        // Sosyal giriş callback'inin ürettiği kodu doğrudan üretip exchange adımını test eder.
        var me = await (await factory.CreateUserClientAsync()).GetFromJsonAsync<MeResponse>("/auth/me");
        var codes = factory.Services.GetRequiredService<LoginCodeStore>();
        var code = await codes.CreateAsync(me!.Id, CancellationToken.None);
        var client = factory.CreateClient();

        var first = await client.PostAsJsonAsync("/auth/exchange", new ExchangeCodeRequest(code));
        var second = await client.PostAsJsonAsync("/auth/exchange", new ExchangeCodeRequest(code));

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Contains("accessToken", await first.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }

    private static async Task<string?> CodeOf(HttpResponseMessage response)
    {
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        return ((JsonElement)problem!.Extensions["code"]!).GetString();
    }
    // ako:end social
}
