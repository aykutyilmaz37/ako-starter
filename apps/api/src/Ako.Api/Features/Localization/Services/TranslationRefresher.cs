using Ako.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using System.Globalization;

namespace Ako.Api.Features.Localization;

/// <summary>
/// Açılışta ve sonra düzenli aralıklarla çeviri ezmelerini ve dilleri veritabanından okur; desteklenen dilleri de
/// günceller (admin yeni dil ekleyince API onu Accept-Language'de kabul eder). Birden fazla API kopyası varsa
/// bir kopyada yapılan değişiklik diğerlerine en geç bu aralıkta ulaşır. Admin işlemleri değişiklikten sonra
/// <see cref="RefreshAsync"/>'i doğrudan çağırır; o kopyada değişiklik anında görünür.
/// </summary>
public sealed class TranslationRefresher(
    IServiceScopeFactory scopes,
    TranslationCatalog catalog,
    IOptions<RequestLocalizationOptions> localization,
    IConfiguration configuration,
    ILogger<TranslationRefresher> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(30);

    // İlk okuma başarılı olana kadar (ör. açılışta migration henüz uygulanmamışken) daha sık denenir.
    private static readonly TimeSpan RetryInterval = TimeSpan.FromSeconds(2);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (string.IsNullOrWhiteSpace(configuration.GetConnectionString("Default")))
        {
            return; // build sırasında openapi.json üretilirken veritabanı yok
        }

        var loaded = false;
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RefreshAsync(stoppingToken);
                loaded = true;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Veritabanı geçici olarak yoksa son bilinen çevirilerle (ilk açılışta dosyalardakilerle) devam edilir.
                if (loaded) logger.LogWarning(ex, "Çeviriler yenilenemedi");
                else logger.LogDebug(ex, "Çeviriler henüz okunamadı, yeniden denenecek");
            }

            await Task.Delay(loaded ? Interval : RetryInterval, stoppingToken);
        }
    }

    // Yenilemeler sırayla çalışır. Aksi hâlde değişiklikten önce okumaya başlamış bir arka plan yenilemesi,
    // admin işleminin yaptığı yenilemeden sonra bitip yeni değeri eskisiyle ezebilir.
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task RefreshAsync(CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try
        {
            using var scope = scopes.CreateScope();
            await catalog.RefreshAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>(), ct);

            var cultures = catalog.Languages.Where(l => l.IsEnabled).Select(l => new CultureInfo(l.Code)).ToList();
            var options = localization.Value;
            options.SupportedCultures = cultures;
            options.SupportedUICultures = cultures;
            options.DefaultRequestCulture = new RequestCulture(catalog.DefaultCulture);
        }
        finally
        {
            _gate.Release();
        }
    }
}
