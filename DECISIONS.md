# ako-starter — Kararlar

Web, mobil ya da ikisini birden içeren projelerin türetileceği başlangıç şablonu. İçinde mari-ui kullanılır. Kararlar 2026-10-18'de, `_POC/nx-hono-dotnet-poc` incelenerek verildi.

## Repo ve araçlar
- **pnpm workspaces + Turborepo**. Nx kullanılmıyor.
- **create-ako-app** (zorunlu): `npm create ako-app` komutuyla çalışan, web/mobil/ikisi seçtiren oluşturucu. Seçilmeyen uygulamaları siler.
- Yapı:
  ```text
  apps/api        .NET 10
  apps/web        React Router v7 + Hono
  apps/mobile     Expo
  packages/api-client   OpenAPI'den üretilen kod
  packages/shared       ortak TS yardımcıları
  ```
- **Kural:** her uygulama tek başına silinebilir. Uygulamalar birbirini import etmez, ortak olan her şey `packages/` altında durur.

## Backend: `apps/api`
- .NET 10 Minimal API, **tek proje + vertical slice**. Domain/Application/Infrastructure diye ayrı projeler yok; bir özellik tek klasörde açılır, tek klasörde silinir.
  - `Actions/<UseCase>.cs`: her use case tek dosya, `#region` sırası İstek → Doğrulama → İş mantığı → Endpoint.
  - `Contracts/`: istemcinin gördüğü şeyler (response, hata kodları).
  - `Data/`: entity ve EF ayarı.
  - `<Özellik>Endpoints.cs`: özelliğin tüm adreslerini kaydeder.
  - Bir özelliğin tüm dosyaları tek namespace'te durur; klasörler yalnızca düzen içindir.
  - Sınırları ArchTests korur: entity'ler EF/HTTP'ye bağımlı olamaz, özellikler birbirini kullanamaz.
  - Repository ve MediatR yok; handler'lar `AppDbContext`'i doğrudan kullanır ve DI'dan alınır.
- PostgreSQL + EF Core (Npgsql), code-first migration'lar, snake_case tablo/kolon adları. Yerelde Postgres Docker Compose ile (Colima) çalışır.
- Hatalar her zaman **ProblemDetails** (RFC 9457) formatında döner. Alan hataları mari-ui `Field` bileşenine bağlanır.
- İş hataları exception yerine `Result`/`Error` ile döner; istemci `code` alanına göre davranır (ör. `products.sku_taken`).
- **Localization:** `Accept-Language` ile tr (varsayılan) / en. Validasyon mesajları, alan adları ve hata açıklamaları `Resources/Messages*.resx` dosyalarında; kodda metin yok.
- API dokümantasyonu: **Swagger UI** (`/swagger`, yalnızca Development). Şemayı .NET'in yerleşik OpenAPI desteği üretir; Swashbuckle yalnızca arayüz için kullanılır.
- Validasyon: **FluentValidation** (şirket standardı). Kurallar OpenAPI'ye kendiliğinden yansımadığı için istemcideki zod şemaları yalnızca tip ve zorunluluk bilgisini taşır; asıl kural kontrolü sunucuda yapılır, hatalar ProblemDetails ile döner.
- Auth: **ASP.NET Core Identity** + Identity'nin hazır endpoint'leri (`MapIdentityApi`), bearer token (access + refresh). Roller: Admin / User.
  - Sosyal giriş: Google, Apple, Facebook, GitHub, X, LinkedIn. Hepsi **tek akış**: OAuth API'de yürür, istemciye tek kullanımlık kod döner, kod `/auth/exchange` ile token'a çevrilir. Web ve mobil aynı akışı kullanır. (GitHub ve LinkedIn'de kod→token değişimi client secret ister; secret mobil uygulamaya konamayacağı için akış sunucuda olmak zorunda.)
  - Mobilde Google ve Apple için ek olarak native giriş: cihazdaki id token `/auth/native/{provider}` ile doğrulanır.
  - E-posta doğrulama, şifre sıfırlama ve e-posta değişikliği **6 haneli kodla** yapılır (link yok); üçü de aynı akış. Gönderim dakikada 1, 5 hatalı denemede kod geçersiz.
  - Doğrulanmamış e-postayla şifreli giriş varsayılan olarak kapalı (`Auth:RequireConfirmedEmail`); sosyal giriş kod istemez.
  - Çok sekme/cihaz senkronu için socket gerekmez: istemci odaklanınca `/auth/me`'yi yeniden çeker (TanStack Query varsayılanı).
  - Sağlayıcı yalnızca ayarı (ClientId) doluysa etkinleşir; secret'lar user-secrets / ortam değişkenlerinde durur.
  - Başka bir sosyal giriş varsa iOS'ta Apple girişi zorunludur (App Store kuralı).
  - create-ako-app "auth olsun mu, hangi sağlayıcılar?" diye sorar. Auth kodu tek klasörde (`Features/Auth`), Program.cs'teki satırları `// ako:auth` ile işaretli.
- `Todos` ve `Products` **örnek özelliklerdir**: kullanıcıya özel veri, herkese açık okuma ve rol bazlı yetkiyi gösterirler; gerçek projede silinirler.

## Contract: `packages/api-client`
- .NET, build sırasında `openapi.json` üretir.
- **Orval** bu dosyadan fetch fonksiyonlarını ve **TanStack Query** hook'larını üretir.
- Turbo sırası: `api build → generate → web/mobile`.
- Üretilen kod commit'tekinden farklıysa CI kırılır. Elle contract yazılmaz.

## Web: `apps/web`
- **React Router v7** framework modu: Vite, SSR, loader/action.
- **Hono** BFF rolünde: httpOnly session cookie'yi tutar ve .NET'e token'ı sunucudan ekler. Tarayıcı .NET'e hiç erişmez, CORS gerekmez.
- Node 22 LTS. Bun daha sonra düşünülebilir; Hono'da bu yalnızca adaptör değişikliğidir.
- mari-ui (`@mari-ui/components`) npm'den gelir.
- Cache: herkese açık sayfalarda `Cache-Control` + CDN (`stale-while-revalidate`), statik sayfalarda prerender.
- **Kural:** iş mantığı loader'lara yazılmaz. Mantık .NET'te, çağrılar `api-client` üzerinden yapılır. Böylece web framework'ü yapının en ince ve en kolay değiştirilen katmanı olarak kalır.
- Next.js'in seçilmeme sebebi: sık çıkan güvenlik açıkları (RSC, Server Actions, middleware) ve düşük RPS.

## Mobil: `apps/mobile`
- Expo + `@mari-ui/native`.
- .NET'e doğrudan bağlanır, bearer token SecureStore'da tutulur.
- Sosyal giriş: tarayıcı akışı (`AuthSession` + `ako://` deep link) tüm sağlayıcılar için; Google ve Apple'da ek olarak native SDK ile id token gönderilebilir.

## Altyapı ve güvenlik
- Docker Compose: Postgres + Mailpit (yerel SMTP, `localhost:8025`) + api + web.
- E-posta: SMTP (MailKit). Sağlayıcıya bağlı değil; ayardan değişir.
- Renovate/Dependabot. CI'da `pnpm audit` ve `dotnet list package --vulnerable` çalışır.
- `@mari-ui/modules` adapter deseni: modüllerin arayüzleri `api-client` ile doldurulur.

## Kurulum sırasında konuşulacaklar
- ~~Form yönetimi~~ → **react-hook-form + Orval'ın ürettiği zod şemaları** (karar verildi).
- ~~Testler~~ → **xUnit + Testcontainers** (.NET), **Vitest + Playwright** (web) (karar verildi).
- i18n gerekecek mi?
- Loglama ve izleme: Serilog, OpenTelemetry.
- Deploy hedefi: VPS + Docker mı, bulut servisi mi?
- create-ako-app'te hangi seçenekler olacak (auth sağlayıcıları, i18n…)?
