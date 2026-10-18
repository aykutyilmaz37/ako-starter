# apps/api

.NET 10 Minimal API, tek proje + vertical slice. Kararlar için kök `DECISIONS.md`'ye bakın.

## Çalıştırma

```bash
pnpm db:up                 # kökten: Postgres + Mailpit'i Docker'da başlatır
pnpm --filter @ako/api dev # http://localhost:5165
```

Development'ta açılışta bekleyen migration'lar otomatik uygulanır ve bir Admin hesabı oluşturulur
(`admin@ako.local` / `Admin123!`, bkz. `appsettings.Development.json`).

- API dokümantasyonu ve deneme arayüzü: <http://localhost:5165/swagger>
- Gönderilen e-postalar (Mailpit gelen kutusu): <http://localhost:8025>
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
    Auth/                        kullanıcılar, roller, giriş (yerel + sosyal)
    Todos/                       ÖRNEK: kullanıcıya özel veri
    Products/                    ÖRNEK: CRUD + sayfalama + rol bazlı yetki
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

## Örnek özellikler

`Todos` ve `Products` yalnızca desenleri göstermek için var; gerçek projede genelde silinirler
(klasörü, `AppDbContext`'teki `DbSet`'i ve `Program.cs`'teki `Map…()` satırını silip yeni bir migration alın).

| | Gösterdiği |
| --- | --- |
| Todos | Tüm adresler giriş ister; her kullanıcı yalnızca kendi kayıtlarını görür (`ICurrentUser`) |
| Products | Listeleme/detay herkese açık, ekleme/güncelleme giriş ister, silme yalnızca Admin |

## Kimlik doğrulama (`Features/Auth`)

- **Yerel hesap:** Identity'nin hazır endpoint'leri: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/manage/*`.
  Giriş, `accessToken` + `refreshToken` döner; istekler `Authorization: Bearer <accessToken>` ile yapılır.
- **Roller:** `Admin` ve `User`. Kayıt olan herkes `User` olur. Endpoint'te `RequireAuthorization()` (giriş yeterli)
  ya da `RequireAuthorization(AppPolicies.Admin)` kullanılır.
- **Kullanıcı bilgisi:** `GET /auth/me`. Handler'larda kullanıcı kimliği `ICurrentUser.Id` ile okunur.
- **E-postalar:** `Email:Smtp:Host` doluysa SMTP ile gönderilir (MailKit, `SmtpEmailSender`), boşsa kod yalnızca
  log'a yazılır. Geliştirmede Mailpit'e gider (`localhost:1025`), hiçbir mail dışarı çıkmaz.
  Production'da herhangi bir SMTP sağlayıcısı (SES, Mailgun, Resend, Brevo, Office 365…) ayarla bağlanır;
  şifre user-secrets / ortam değişkeniyle verilir: `Email__Smtp__Password`.

### E-posta kodları (6 hane)

Link gönderilmez; üç işlem de aynı akışı kullanır: **kod gönder → kodu doğrula**.

| İşlem | Kod gönder | Doğrula |
| --- | --- | --- |
| E-posta doğrulama | kayıtta otomatik, tekrar için `POST /auth/email/confirm/send { email }` | `POST /auth/email/confirm { email, code }` |
| Şifre sıfırlama | `POST /auth/password/forgot { email }` | `POST /auth/password/reset { email, code, newPassword }` |
| E-posta değiştirme (giriş gerekir) | `POST /auth/email/change { newEmail }` | `POST /auth/email/change/confirm { newEmail, code }` |

- Kod ~10 dakika geçerli. Aynı kişiye dakikada en fazla 1 kod gider (`auth.code_throttled`, 429).
- 5 yanlış denemeden sonra yeni kod istenmeden doğrulama yapılmaz (`auth.too_many_attempts`, 429).
- Gönderim adresleri, e-posta kayıtlı olmasa da 204 döner (kayıtlı adresler dışarıdan anlaşılmasın).
- `Auth:RequireConfirmedEmail` (varsayılan `true`): e-postası doğrulanmamış kullanıcı **e-posta + şifreyle** giriş yapamaz.
  Sosyal girişle açılan hesaplar doğrulanmış sayılır, kod istemez.
- Identity'nin link tabanlı adresleri (`/confirmEmail`, `/forgotPassword`, `/resetPassword`, `/resendConfirmationEmail`) kapalıdır.

### Sosyal giriş

Google, Apple, Facebook, GitHub, X ve LinkedIn hazır. Bir sağlayıcı yalnızca ayarı doluysa etkinleşir;
`GET /auth/providers` istemciye hangi butonları göstereceğini söyler.

```text
1) istemci tarayıcıda açar:  GET /auth/external/github?returnUrl=http://localhost:5173/auth/callback
2) kullanıcı GitHub'da giriş yapar → API kullanıcıyı bulur ya da oluşturur
3) tarayıcı döner:           http://localhost:5173/auth/callback?code=…   (hata varsa ?error=<kod>)
4) istemci:                  POST /auth/exchange { code } → accessToken + refreshToken
```

- Web ve mobil aynı akışı kullanır (mobilde `ako://auth/callback` gibi bir deep link ile).
- `returnUrl`, `Auth:AllowedReturnUrls` listesindeki bir adresle başlamalıdır.
- **Mobilde native giriş (Google, Apple):** cihazdaki SDK'nın verdiği id token → `POST /auth/native/google { idToken }`.
  `Auth:Providers:<Ad>:NativeClientIds` doluysa açılır (Google için iOS/Android client id'leri, Apple için bundle id).
- Aynı e-postalı mevcut hesaba otomatik bağlanma yalnızca e-postayı doğrulayan sağlayıcılarda (Google, Apple) yapılır;
  diğerlerinde `auth.email_in_use` döner.

Sağlayıcı anahtarları **repoya yazılmaz**, user-secrets ile girilir:

```bash
cd apps/api/src/Ako.Api
dotnet user-secrets set "Auth:Providers:GitHub:ClientId" "<client-id>"
dotnet user-secrets set "Auth:Providers:GitHub:ClientSecret" "<client-secret>"
```

Callback adresleri (sağlayıcı panelinde tanımlanır): `/signin-google`, `/signin-facebook`, `/signin-github`,
`/signin-twitter`, `/signin-linkedin`, `/signin-apple`. Apple callback'i form POST olduğu için HTTPS gerektirir.

## Hatalar

- **Doğrulama:** 400, `{ errors: { price: ["'Fiyat' değeri '0' değerinden büyük olmalı."] } }`
- **Yetki:** 401 (giriş yok) / 403 (rol yetmiyor).
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
