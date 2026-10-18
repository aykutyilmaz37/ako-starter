# apps/api

.NET 10 Minimal API, tek proje + vertical slice. Kararlar için kök `DECISIONS.md`'ye bakın.

## Çalıştırma

```bash
pnpm db:up                 # kökten: Postgres'i Docker'da başlatır
pnpm --filter @ako/api dev # http://localhost:5165
```

- API dokümantasyonu ve deneme arayüzü: <http://localhost:5165/swagger>
- Canlı OpenAPI şeması: <http://localhost:5165/openapi/v1.json>
- `openapi.json` (bu klasörde): build sırasında üretilir, commit edilir, `packages/api-client` bunu okur.

## Yapı

```text
src/Ako.Api/
  Program.cs              servis kaydı + endpoint eşlemesi
  Common/                 Result/Error, sayfalama, validasyon filtresi, ProblemDetails çevirisi
  Infrastructure/         DbContext, migration'lar, DI ve localization kurulumu
  Resources/              Messages.resx (tr, varsayılan) + Messages.en.resx
  Features/
    Products/
      Actions/                   bir use case = bir dosya
        CreateProduct.cs
        ListProducts.cs …
      Contracts/                 istemcinin gördüğü şeyler
        ProductResponse.cs       API'nin döndüğü JSON
        ProductErrors.cs         hata kodları
      Data/                      veritabanı tarafı
        Product.cs               entity: veri + iş kuralları
        ProductConfiguration.cs  EF ayarı (tablo, index, kolon uzunlukları)
      ProductEndpoints.cs        /products adreslerinin kaydı
tests/
  Ako.Api.Tests/          gerçek Postgres (Testcontainers) ile HTTP testleri
  Ako.ArchTests/          yapı kuralları (özellikler birbirini kullanmaz vb.)
```

Her use case dosyası aynı sırayla `#region`'lara ayrılır:

| Region | Ne yapar | Frontend karşılığı |
| --- | --- | --- |
| İstek | Gelen JSON / query string'in tipi | `api-client`'taki request tipi |
| Doğrulama | FluentValidation kuralları; hata → 400 + `errors.<alan>` | form alan hataları (`Field`) |
| İş mantığı | `XxxHandler.HandleAsync`, veritabanıyla konuşan kısım | — |
| Endpoint | URL + HTTP metodu, handler'ı çağırır, sonucu HTTP'ye çevirir | Orval hook'u (`useCreateProduct`) |

## Hatalar

- **Doğrulama:** 400, `{ errors: { price: ["'Fiyat' değeri '0' değerinden büyük olmalı."] } }`
- **İş hatası:** 404/409, `{ code: "products.sku_taken", detail: "…" }`. İstemci `code`'a göre karar verir, `detail`'i gösterir.
- Mesajların dili `Accept-Language` başlığına göre seçilir (`tr` varsayılan, `en`). Metinler `Resources/*.resx` dosyalarında durur; kodda metin yoktur.

## Yeni özellik eklemek

1. `Data/` altına entity (`IEntity`) ve configuration, `Contracts/` altına response ve errors, kökte `<Özellik>Endpoints.cs` (`Map<Özellik>()`).
2. Her use case için `Features/<Özellik>/Actions/<UseCase>.cs` (yukarıdaki region sırasıyla). Handler adı `Handler` ile biterse DI'a otomatik kaydedilir.
3. `AppDbContext`'e `DbSet` ekleyin, `Program.cs`'te `app.Map<Özellik>()` çağırın.
4. Hata kodları ve alan adları için `Messages.resx` ve `Messages.en.resx`'e anahtar ekleyin.
5. Migration: `dotnet ef migrations add <Ad> --project src/Ako.Api -o Infrastructure/Data/Migrations`

## Testler

```bash
dotnet test Ako.slnx
```

Docker gerekir. Colima kullanılıyorsa `~/.testcontainers.properties` içinde şu iki satır olmalı:

```text
docker.host=unix:///Users/<kullanıcı>/.colima/default/docker.sock
docker.socket.override=/var/run/docker.sock
```
