using System.Net;
using System.Net.Http.Json;
using Ako.Api.Common;
using Ako.Api.Features.Auth;
using Microsoft.AspNetCore.Hosting;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class AdminTests(ApiFactory factory)
{
    [Fact]
    public async Task Admin_kullanicilari_rolleriyle_listeler_normal_kullanici_403_alir()
    {
        var email = $"liste-{Guid.NewGuid():N}@test.local";
        var user = await factory.CreateUserClientAsync(email);
        var admin = await factory.CreateAdminClientAsync();

        var page = await admin.GetFromJsonAsync<PagedResponse<AdminUserResponse>>($"/admin/users?search={email}");

        Assert.Equal([AppRoles.User], page!.Items.Single().Roles);
        Assert.Equal(HttpStatusCode.Forbidden, (await user.GetAsync("/admin/users")).StatusCode);
    }

    [Fact]
    public async Task Admin_rol_atar_ve_kendi_Admin_rolunu_kaldiramaz()
    {
        var email = $"rol-{Guid.NewGuid():N}@test.local";
        await factory.CreateUserClientAsync(email);
        var admin = await factory.CreateAdminClientAsync();
        var target = (await admin.GetFromJsonAsync<PagedResponse<AdminUserResponse>>($"/admin/users?search={email}"))!.Items.Single();

        var set = await admin.PutAsJsonAsync($"/admin/users/{target.Id}/roles", new SetUserRolesRequest([AppRoles.Admin, AppRoles.User]));
        Assert.Equal(HttpStatusCode.OK, set.StatusCode);
        Assert.Equal([AppRoles.Admin, AppRoles.User], (await set.Content.ReadFromJsonAsync<string[]>())!);

        var me = await admin.GetFromJsonAsync<MeResponse>("/auth/me");
        var self = await admin.PutAsJsonAsync($"/admin/users/{me!.Id}/roles", new SetUserRolesRequest([AppRoles.User]));
        Assert.Equal(HttpStatusCode.BadRequest, self.StatusCode);
        Assert.Contains("auth.cannot_remove_own_admin", await self.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Tanimsiz_rol_400_doner()
    {
        var admin = await factory.CreateAdminClientAsync();
        var me = await admin.GetFromJsonAsync<MeResponse>("/auth/me");

        var response = await admin.PutAsJsonAsync($"/admin/users/{me!.Id}/roles", new SetUserRolesRequest(["Admin", "Patron"]));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Admin_kapaliyken_adresler_hic_olusmaz()
    {
        // İnternete açık deploy: Api:EnableAdminEndpoints=false → Admin token'ı olsa bile 404.
        using var publicApi = factory.WithWebHostBuilder(b => b.UseSetting("Api:EnableAdminEndpoints", "false"));
        var client = publicApi.CreateClient();
        var token = (await factory.CreateAdminClientAsync()).DefaultRequestHeaders.Authorization;
        client.DefaultRequestHeaders.Authorization = token;

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/admin/users")).StatusCode);
    }
}
