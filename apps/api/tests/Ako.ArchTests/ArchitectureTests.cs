using System.Reflection;
using Ako.Api.Common;
using NetArchTest.Rules;

namespace Ako.ArchTests;

/// <summary>
/// Proje tek parça olduğu için katman sınırlarını derleyici değil bu testler korur.
/// Bir kural kırılırsa CI kırmızıya döner.
/// </summary>
public sealed class ArchitectureTests
{
    private static readonly Assembly Api = typeof(IEntity).Assembly;
    private const string FeaturesNamespace = "Ako.Api.Features";

    private static IEnumerable<string> FeatureNamespaces() =>
        Api.GetTypes()
            .Select(t => t.Namespace)
            .OfType<string>()
            .Where(ns => ns.StartsWith(FeaturesNamespace + ".", StringComparison.Ordinal))
            .Distinct();

    [Fact]
    public void Entityler_altyapiya_bagimli_olmaz()
    {
        // İş kuralları EF Core'dan, HTTP'den ve doğrulama kütüphanesinden bağımsız kalır.
        var result = Types.InAssembly(Api)
            .That().ImplementInterface(typeof(IEntity))
            .ShouldNot().HaveDependencyOnAny("Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore", "FluentValidation")
            .GetResult();

        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Fact]
    public void Ozellikler_birbirini_kullanmaz()
    {
        // Bir özellik silindiğinde diğerleri kırılmamalı. Ortak ihtiyaç Common'a taşınır.
        var features = FeatureNamespaces().ToArray();
        Assert.NotEmpty(features);

        foreach (var feature in features)
        {
            var others = features.Where(f => f != feature).ToArray();
            var result = Types.InAssembly(Api)
                .That().ResideInNamespace(feature)
                .ShouldNot().HaveDependencyOnAny(others)
                .GetResult();

            Assert.True(result.IsSuccessful, $"{feature}: {Describe(result)}");
        }
    }

    [Fact]
    public void Common_ozelliklere_bagimli_olmaz()
    {
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace("Ako.Api.Common")
            .ShouldNot().HaveDependencyOn(FeaturesNamespace)
            .GetResult();

        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Fact]
    public void Handler_siniflari_sealed_ve_Handler_ile_biter()
    {
        // Otomatik DI kaydı adın "Handler" ile bitmesine dayanır.
        var result = Types.InAssembly(Api)
            .That().ResideInNamespace(FeaturesNamespace)
            .And().HaveNameEndingWith("Handler")
            .Should().BeSealed()
            .GetResult();

        Assert.True(result.IsSuccessful, Describe(result));
    }

    private static string Describe(TestResult result) =>
        string.Join(", ", result.FailingTypeNames ?? []);
}
