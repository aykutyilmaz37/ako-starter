using Ako.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ako.Api.Features.Products;

/// <summary>
/// ÖRNEK VERİ: "Akı Kahve" senaryosu (butik kahve kavurucusu). Yalnızca Development'ta ve bu ürünler yoksa eklenir
/// (bkz. Infrastructure/DevDataInitializer). Görseller wwwroot/images/products altında.
/// </summary>
internal static class ProductSeed
{
    private sealed record Item(string Sku, string Name, ProductCategory Category, string Image, decimal Price, int Stock, string Description);

    private static readonly Item[] Items =
    [
        new("AK-ETH-YRG", "Etiyopya Yirgacheffe", ProductCategory.Coffee, "etiyopya-yirgacheffe", 520m, 42,
            "Yıkanmış işlem, 1.900–2.200 m. Açık kavrum. Bergamot, yasemin ve limon kabuğu notaları; çay gibi hafif bir gövde. V60 ve Chemex için ideal."),
        new("AK-COL-HUI", "Kolombiya Huila", ProductCategory.Coffee, "kolombiya-huila", 460m, 58,
            "Yıkanmış işlem, 1.600–1.800 m. Orta kavrum. Karamel, kırmızı elma ve sütlü çikolata. Her demleme yöntemiyle dengeli bir fincan."),
        new("AK-KEN-NYE", "Kenya Nyeri AA", ProductCategory.Coffee, "kenya-nyeri", 590m, 18,
            "Yıkanmış işlem, SL28 ve SL34 çeşitleri. Açık-orta kavrum. Frenk üzümü, greyfurt ve canlı, sulu bir asidite."),
        new("AK-BRA-CER", "Brezilya Cerrado", ProductCategory.Coffee, "brezilya-cerrado", 390m, 75,
            "Doğal işlem. Orta-koyu kavrum. Fındık, kakao ve düşük asidite. Sütlü içecekler ve French press için."),
        new("AK-GUA-ANT", "Guatemala Antigua", ProductCategory.Coffee, "guatemala-antigua", 480m, 0,
            "Yıkanmış işlem, volkanik toprak. Orta kavrum. Kahverengi şeker, portakal ve baharat. Yeni hasat yolda."),
        new("AK-ESP-HRM", "Akı Espresso Harmanı", ProductCategory.Coffee, "aki-espresso", 420m, 120,
            "Brezilya ve Kolombiya harmanı. Koyu kavrum. Bitter çikolata, karamel ve yoğun krema. Espresso ve moka pot için."),
        new("AK-EQP-V60", "V60 Demleme Seti", ProductCategory.Equipment, "v60-demleme-seti", 1150m, 24,
            "Seramik V60 02 demleyici, cam sürahi ve 40 adet filtre kağıdı. Filtre kahveye başlamak için ihtiyacınız olan her şey."),
        new("AK-EQP-GRN", "Seramik Çarklı El Değirmeni", ProductCategory.Equipment, "el-degirmeni", 2900m, 6,
            "Ayarlanabilir seramik çark, 30 g hazne. Türk kahvesinden French press'e kadar homojen öğütme."),
        new("AK-EQP-KET", "Ağızlı Su Isıtıcısı", ProductCategory.Equipment, "kettle", 3400m, 4,
            "0,9 L, sıcaklık ayarlı, ince ağızlı. Pour-over demlemede suyu tam istediğiniz hızda dökün."),
        new("AK-ACC-SCL", "Hassas Kahve Terazisi", ProductCategory.Accessory, "hassas-terazi", 1450m, 30,
            "0,1 g hassasiyet, dahili zamanlayıcı. Tekrarlanabilir tarifler için kahveyi ve suyu tartın."),
        new("AK-ACC-FLT", "V60 Filtre Kağıdı (100'lü)", ProductCategory.Accessory, "filtre-kagidi", 180m, 200,
            "02 boy, ağartılmamış. Demlemeden önce sıcak suyla ıslatmayı unutmayın."),
        new("AK-ACC-MUG", "Akı Seramik Kupa", ProductCategory.Accessory, "seramik-kupa", 350m, 60,
            "El yapımı, 300 ml, mat sır. Bulaşık makinesinde yıkanabilir."),
    ];

    public static async Task SeedAsync(AppDbContext db, CancellationToken ct)
    {
        if (await db.Products.AnyAsync(p => p.Sku.StartsWith("AK-"), ct))
        {
            return;
        }

        foreach (var item in Items)
        {
            db.Products.Add(Product.Create(
                item.Sku, item.Name, item.Description, item.Category, $"/images/products/{item.Image}.svg", item.Price, item.Stock));
        }
        await db.SaveChangesAsync(ct);
    }
}
