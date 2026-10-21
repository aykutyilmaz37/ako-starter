using Ako.Api.Features.Products; // ako:sample
using Ako.Api.Infrastructure.Data; // ako:sample

namespace Ako.Api.Infrastructure;

/// <summary>
/// Yalnızca Development'ta, uygulama açılırken çalışır:
/// 1) Veritabanını hazırlar: migration'lar + ("Auth:Admin" doluysa) Admin hesabı (DatabaseMigrator).
///    Elle "dotnet ef database update" gerekmez. Production'da aynısı deploy adımında: "dotnet Ako.Api.dll migrate".
/// 2) Örnek ürünleri ekler (yoksa). Production'da eklenmez.
/// </summary>
internal sealed class DevDataInitializer(IServiceProvider services) : IHostedService
{
    public async Task StartAsync(CancellationToken ct)
    {
        await DatabaseMigrator.RunAsync(services, ct);

        // ako:begin sample
        using var scope = services.CreateScope();
        await ProductSeed.SeedAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>(), ct); // örnek ürünler (Akı Kahve)
        // ako:end sample
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
