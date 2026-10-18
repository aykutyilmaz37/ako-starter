using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Ako.Api.Features.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ako.Api.Tests;

[Collection(ApiCollection.Name)]
public sealed class EmailCodeTests(ApiFactory factory)
{
    private readonly HttpClient _client = factory.CreateClient();
    private static string NewEmail() => $"code-{Guid.NewGuid():N}@test.local";

    private Task<HttpResponseMessage> Register(string email) =>
        _client.PostAsJsonAsync("/auth/register", new { email, password = ApiFactory.Password });

    private Task<HttpResponseMessage> Login(string email, string password = ApiFactory.Password) =>
        _client.PostAsJsonAsync("/auth/login", new { email, password });

    [Fact]
    public async Task Kayittan_sonra_6_haneli_kod_gider_ve_dogrulanmadan_giris_yapilamaz()
    {
        var email = NewEmail();
        await Register(email);

        var code = factory.Emails.LastCode(email, EmailCodePurpose.ConfirmEmail);
        Assert.Matches("^[0-9]{6}$", code);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Login(email)).StatusCode);

        var confirm = await _client.PostAsJsonAsync("/auth/email/confirm", new ConfirmEmailRequest(email, code));
        Assert.Equal(HttpStatusCode.NoContent, confirm.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login(email)).StatusCode);
    }

    [Fact]
    public async Task Bes_yanlis_denemeden_sonra_dogru_kod_da_reddedilir()
    {
        var email = NewEmail();
        await Register(email);
        var code = factory.Emails.LastCode(email, EmailCodePurpose.ConfirmEmail);
        var wrong = code == "000000" ? "111111" : "000000";

        for (var i = 0; i < 5; i++)
        {
            var attempt = await _client.PostAsJsonAsync("/auth/email/confirm", new ConfirmEmailRequest(email, wrong));
            Assert.Equal("auth.invalid_code", await CodeOf(attempt));
        }

        var blocked = await _client.PostAsJsonAsync("/auth/email/confirm", new ConfirmEmailRequest(email, code));
        Assert.Equal(HttpStatusCode.TooManyRequests, blocked.StatusCode);
        Assert.Equal("auth.too_many_attempts", await CodeOf(blocked));
    }

    [Fact]
    public async Task Kod_dakikada_bir_kez_yeniden_gonderilebilir()
    {
        var email = NewEmail();
        await Register(email); // kayıt ilk kodu gönderdi

        var resend = await _client.PostAsJsonAsync("/auth/email/confirm/send", new SendConfirmationCodeRequest(email));

        Assert.Equal(HttpStatusCode.TooManyRequests, resend.StatusCode);
        Assert.Equal("auth.code_throttled", await CodeOf(resend));
    }

    [Fact]
    public async Task Kayitli_olmayan_e_posta_icin_de_204_doner()
    {
        var response = await _client.PostAsJsonAsync("/auth/password/forgot", new ForgotPasswordRequest(NewEmail()));
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Sifre_kodla_sifirlanir()
    {
        var email = $"reset-{Guid.NewGuid():N}@test.local";
        await factory.CreateUserClientAsync(email);

        await _client.PostAsJsonAsync("/auth/password/forgot", new ForgotPasswordRequest(email));
        var code = factory.Emails.LastCode(email, EmailCodePurpose.ResetPassword);

        var weak = await _client.PostAsJsonAsync("/auth/password/reset", new ResetPasswordRequest(email, code, "kisa"));
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);
        var problem = await weak.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
        Assert.Contains("newPassword", problem!.Errors.Keys);

        var reset = await _client.PostAsJsonAsync("/auth/password/reset", new ResetPasswordRequest(email, code, "YeniSifre123!"));
        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Login(email)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login(email, "YeniSifre123!")).StatusCode);
    }

    [Fact]
    public async Task E_posta_kodla_degistirilir_ve_yeni_adresle_giris_yapilir()
    {
        var oldEmail = NewEmail();
        var newEmail = NewEmail();
        var client = await factory.CreateUserClientAsync(oldEmail);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/auth/email/change", new ChangeEmailRequest(newEmail))).StatusCode);
        var code = factory.Emails.LastCode(newEmail, EmailCodePurpose.ChangeEmail);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/auth/email/change/confirm", new ConfirmChangeEmailRequest(newEmail, code))).StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized, (await Login(oldEmail)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login(newEmail)).StatusCode);
    }

    [Theory]
    [InlineData("/auth/forgotPassword")]
    [InlineData("/auth/resetPassword")]
    [InlineData("/auth/resendConfirmationEmail")]
    public async Task Identity_nin_link_tabanli_adresleri_kapali(string path)
    {
        var response = await _client.PostAsJsonAsync(path, new { email = NewEmail() });
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Sosyal_girisle_acilan_hesap_dogrulanmis_sayilir()
    {
        // GitHub e-postayı "güvenilir" vermese de hesap kod istemez.
        using var scope = factory.Services.CreateScope();
        var resolver = scope.ServiceProvider.GetRequiredService<ExternalUserResolver>();
        var github = ExternalProviders.Find("github")!;

        var user = await resolver.ResolveAsync(new ExternalIdentity(github, Guid.NewGuid().ToString("N"), NewEmail()));

        Assert.True(user.IsSuccess);
        Assert.True(user.Value.EmailConfirmed);
    }

    private static async Task<string?> CodeOf(HttpResponseMessage response)
    {
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        return ((JsonElement)problem!.Extensions["code"]!).GetString();
    }
}
