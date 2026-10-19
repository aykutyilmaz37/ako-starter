using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Ako.Api.Common;
using Ako.Api.Features.Localization;
using Microsoft.AspNetCore.Mvc;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class LocalizationTests(ApiFactory factory)
{
    [Fact]
    public async Task Acik_diller_varsayilan_once_listelenir()
    {
        var languages = await factory.CreateClient().GetFromJsonAsync<LanguageResponse[]>("/localization/languages");

        Assert.Equal("tr", languages![0].Code);
        Assert.True(languages[0].IsDefault);
        Assert.Contains(languages, l => l.Code == "de" && l.Name == "Deutsch");
    }

    [Fact]
    public async Task Sozluk_dilde_doner_ve_degismediyse_304_alir()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/localization/de/api");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var dictionary = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.Equal("Konflikt.", dictionary!["problem.409"]);

        using var again = new HttpRequestMessage(HttpMethod.Get, "/localization/de/api");
        again.Headers.IfNoneMatch.Add(response.Headers.ETag!);
        Assert.Equal(HttpStatusCode.NotModified, (await client.SendAsync(again)).StatusCode);

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/localization/xx/api")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/localization/de/yok")).StatusCode);
    }

    [Fact]
    public async Task Tablodan_ezilen_metin_hata_mesajinda_gorunur_silinince_dosyaya_doner()
    {
        var admin = await factory.CreateAdminClientAsync();
        var user = await factory.CreateUserClientAsync();
        user.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue("de"));

        var set = await admin.PutAsJsonAsync("/admin/localization/translations",
            new SetTranslationRequest(TranslationNamespaces.Api, "de", "todos.not_found", "Aufgabe {0} fehlt."));
        Assert.Equal(HttpStatusCode.OK, set.StatusCode);
        var cell = (await set.Content.ReadFromJsonAsync<TranslationEntryResponse>())!.Values["de"];
        Assert.True(cell.IsOverridden);

        var id = Guid.NewGuid();
        Assert.Equal($"Aufgabe {id} fehlt.", await Detail(user.GetAsync($"/todos/{id}")));

        await admin.PutAsJsonAsync("/admin/localization/translations",
            new SetTranslationRequest(TranslationNamespaces.Api, "de", "todos.not_found", null));
        Assert.Equal($"Aufgabe '{id}' wurde nicht gefunden.", await Detail(user.GetAsync($"/todos/{id}")));

        static async Task<string?> Detail(Task<HttpResponseMessage> request) =>
            (await (await request).Content.ReadFromJsonAsync<ProblemDetails>())!.Detail;
    }

    [Fact]
    public async Task Tanimsiz_anahtar_404_normal_kullanici_403_alir()
    {
        var admin = await factory.CreateAdminClientAsync();
        var user = await factory.CreateUserClientAsync();
        var body = new SetTranslationRequest(TranslationNamespaces.Api, "en", "yok.boyle.bir.anahtar", "x");

        var unknown = await admin.PutAsJsonAsync("/admin/localization/translations", body);
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
        Assert.Contains("localization.key_not_found", await unknown.Content.ReadAsStringAsync());

        Assert.Equal(HttpStatusCode.Forbidden, (await user.PutAsJsonAsync("/admin/localization/translations", body)).StatusCode);
    }

    [Fact]
    public async Task Yeni_dil_eklenir_eksik_metinler_varsayilan_dilden_gelir()
    {
        var admin = await factory.CreateAdminClientAsync();

        var create = await admin.PostAsJsonAsync("/admin/localization/languages", new CreateLanguageRequest("FR", "Français"));
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        Assert.Equal("fr", (await create.Content.ReadFromJsonAsync<LanguageResponse>())!.Code);

        var again = await admin.PostAsJsonAsync("/admin/localization/languages", new CreateLanguageRequest("fr", "Français"));
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);

        var dictionary = await factory.CreateClient().GetFromJsonAsync<Dictionary<string, string>>("/localization/fr/api");
        Assert.Equal("Çakışma.", dictionary!["problem.409"]);

        var missing = await admin.GetFromJsonAsync<PagedResponse<TranslationEntryResponse>>(
            "/admin/localization/translations?namespace=api&onlyMissing=true&search=problem.409");
        Assert.Null(missing!.Items.Single().Values["fr"].Value);

        var invalid = await admin.PostAsJsonAsync("/admin/localization/languages", new CreateLanguageRequest("xx-yy-zz", "?"));
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    [Fact]
    public async Task Disa_aktarma_resx_dosyasi_uretir()
    {
        var admin = await factory.CreateAdminClientAsync();

        var response = await admin.GetAsync("/admin/localization/export/api/en");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Messages.en.resx", response.Content.Headers.ContentDisposition!.FileName);
        var resx = await response.Content.ReadAsStringAsync();
        Assert.Contains("""<data name="problem.409" xml:space="preserve">""", resx);
        Assert.Contains("<value>Conflict.</value>", resx);
    }
}
