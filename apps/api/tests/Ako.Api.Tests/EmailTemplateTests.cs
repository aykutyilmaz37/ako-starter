using Ako.Api.Infrastructure.Email;

namespace Ako.Api.Tests;

public sealed class EmailTemplateTests
{
    [Fact]
    public void Kod_sablonu_layout_icine_yerlesir_ve_degerler_kacislanir()
    {
        var html = EmailTemplates.Render("Code", new Dictionary<string, string>
        {
            ["appName"] = "Ako",
            ["subject"] = "Konu",
            ["intro"] = "<script>alert(1)</script>",
            ["code"] = "123456",
            ["note"] = "Not",
            ["footer"] = "Alt bilgi",
        });

        Assert.StartsWith("<!doctype html>", html);
        Assert.Contains("123456", html);
        Assert.Contains("&lt;script&gt;", html);       // kullanıcıdan gelebilecek değerler HTML olarak çalışmaz
        Assert.DoesNotContain("<script>", html);
        Assert.DoesNotContain("{{", html);              // doldurulmamış yer tutucu kalmaz
        Assert.DoesNotContain("<!--", html);            // şablon açıklamaları maile girmez
    }
}
