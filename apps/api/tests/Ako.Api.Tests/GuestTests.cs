using System.Net;
using System.Net.Http.Json;
using Ako.Api.Common;
using Ako.Api.Features.Auth;
using Ako.Api.Features.Todos;
using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class GuestTests(ApiFactory factory)
{
    [Fact]
    public async Task Misafir_token_alir_Guest_rolundedir_ve_e_postasi_yoktur()
    {
        var (client, tokens) = await factory.CreateGuestClientAsync();

        var me = await client.GetFromJsonAsync<MeResponse>("/auth/me");

        Assert.Equal([AppRoles.Guest], me!.Roles);
        Assert.Null(me.Email);
        Assert.False(string.IsNullOrEmpty(tokens.RefreshToken));
    }

    [Fact]
    public async Task Misafir_refresh_token_ile_oturumunu_yeniler()
    {
        var (client, tokens) = await factory.CreateGuestClientAsync();

        var response = await client.PostAsJsonAsync("/auth/refresh", new { tokens.RefreshToken });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Misafire_acik_ozellik_calisir_uyeye_ozel_endpoint_403_doner()
    {
        var (client, _) = await factory.CreateGuestClientAsync();

        var create = await client.PostAsJsonAsync("/todos", new CreateTodoRequest("Filtre kağıdı"));
        var changeEmail = await client.PostAsJsonAsync("/auth/email/change", new { newEmail = "x@test.local" });

        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, changeEmail.StatusCode);
    }

    [Fact]
    public async Task Misafir_hesabi_aldiginda_verisi_hesaba_gecer_ve_misafir_silinir()
    {
        var (guest, tokens) = await factory.CreateGuestClientAsync();
        await guest.PostAsJsonAsync("/todos", new CreateTodoRequest("Süt"));
        await guest.PostAsJsonAsync("/todos", new CreateTodoRequest("Çekirdek"));
        var guestId = (await guest.GetFromJsonAsync<MeResponse>("/auth/me"))!.Id;

        var member = await factory.CreateUserClientAsync();
        var claim = await member.PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest(tokens.RefreshToken));

        Assert.Equal(HttpStatusCode.NoContent, claim.StatusCode);
        var todos = await member.GetFromJsonAsync<TodoResponse[]>("/todos");
        Assert.Equal(new[] { "Süt", "Çekirdek" }.Order(StringComparer.Ordinal), todos!.Select(t => t.Title).Order(StringComparer.Ordinal));

        using var scope = factory.Services.CreateScope();
        Assert.False(await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.AnyAsync(u => u.Id == guestId));
    }

    [Fact]
    public async Task Talep_tekrarlanirsa_basarili_sayilir_ve_veri_ikilenmez()
    {
        var (guest, tokens) = await factory.CreateGuestClientAsync();
        await guest.PostAsJsonAsync("/todos", new CreateTodoRequest("Tek"));
        var member = await factory.CreateUserClientAsync();

        await member.PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest(tokens.RefreshToken));
        var again = await member.PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest(tokens.RefreshToken));

        Assert.Equal(HttpStatusCode.NoContent, again.StatusCode);
        Assert.Single(await member.GetFromJsonAsync<TodoResponse[]>("/todos") ?? []);
    }

    [Fact]
    public async Task Gecersiz_misafir_token_i_400_doner()
    {
        var member = await factory.CreateUserClientAsync();

        var response = await member.PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest("sahte-token"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("auth.invalid_guest_token", (await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>()).GetProperty("code").GetString());
    }

    [Fact]
    public async Task Uye_token_i_misafir_token_i_olarak_kullanilamaz()
    {
        var other = await factory.CreateUserClientAsync();
        var login = await factory.CreateClient().PostAsJsonAsync("/auth/login", new { email = ApiFactory.AdminEmail, password = ApiFactory.Password });
        var tokens = (await login.Content.ReadFromJsonAsync<AccessTokenResponse>())!;

        var response = await other.PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest(tokens.RefreshToken));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Misafir_baska_bir_misafiri_talep_edemez()
    {
        var (_, first) = await factory.CreateGuestClientAsync();
        var (second, _) = await factory.CreateGuestClientAsync();

        var response = await second.PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest(first.RefreshToken));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Talep_icin_token_gerekir()
    {
        var response = await factory.CreateClient().PostAsJsonAsync("/auth/guest/claim", new ClaimGuestRequest("x"));
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Suresi_dolan_misafir_verisiyle_birlikte_temizlenir_aktif_olan_kalir()
    {
        var (old, _) = await factory.CreateGuestClientAsync();
        var (fresh, _) = await factory.CreateGuestClientAsync();
        await old.PostAsJsonAsync("/todos", new CreateTodoRequest("Eski"));
        var oldId = (await old.GetFromJsonAsync<MeResponse>("/auth/me"))!.Id;
        var freshId = (await fresh.GetFromJsonAsync<MeResponse>("/auth/me"))!.Id;

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Users.Where(u => u.Id == oldId).ExecuteUpdateAsync(s => s.SetProperty(u => u.LastActiveAt, DateTimeOffset.UtcNow.AddDays(-40)));

        var cleanup = factory.Services.GetServices<Microsoft.Extensions.Hosting.IHostedService>().OfType<GuestCleanupService>().Single();
        var removed = await cleanup.CleanAsync(CancellationToken.None);

        Assert.True(removed >= 1);
        Assert.False(await db.Users.AnyAsync(u => u.Id == oldId));
        Assert.False(await db.Todos.AnyAsync(t => t.UserId == oldId));
        Assert.True(await db.Users.AnyAsync(u => u.Id == freshId));
    }
}
