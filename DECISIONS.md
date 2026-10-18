# ako-starter — Kararlar

Web, mobil ya da ikisini birden içeren projelerin türetileceği başlangıç şablonu. İçinde mari-ui kullanılır. Kararlar 2026-10-18'de, `_POC/nx-hono-dotnet-poc` incelenerek verildi.

## Repo ve araçlar

- **pnpm workspaces + Turborepo**. Nx kullanılmıyor.
- **create-ako-app** (zorunlu): `npm create ako-app` komutuyla çalışan, web/mobil/ikisi seçtiren oluşturucu. Seçilmeyen uygulamaları siler.
- Yapı:
  ```text
  apps/api              .NET 10 (tek API)
  apps/web/<ürün>       her web ürünü ayrı uygulama: React Router 8 + Hono (ör. backoffice, investment, deposit)
  apps/mobile           Expo
  packages/api-client   OpenAPI'den üretilen kod
  packages/ui           web uygulamalarının ortak bileşenleri (mari-ui üstüne)
  packages/web-core     ortak BFF (Hono) kurulumu: session cookie, auth, API'ye token ekleme
  packages/shared       ortak TS yardımcıları
  ```
- **Birden fazla web ürünü / backoffice:** aynı monorepoda `apps/web/` altında ayrı uygulamalar; ayrı build, ayrı domain, ayrı deploy. Tek uygulamada sayfa grupları olarak tutulmaz (müşteri paketine admin kodu girmez, biri diğerini yeniden yayınlatmaz). Ayrı repo yalnızca ayrı ekip/takvim ya da zorunlu ağ ayrımı varsa.
- **Backoffice güvenliği:** aynı API kodu, iki deploy. İnternete açık örnekte admin endpoint'leri kapalı (`Api:EnableAdminEndpoints=false`, adresler hiç oluşmaz), iç ağdaki/VPN'deki örnekte açık. Rol kontrolü (`AppPolicies.Admin`) ikinci katman olarak kalır. Admin endpoint'leri her özelliğin içinde `Actions/Admin/` altında, `/admin/...` adresinde durur; yönetim işlemleri (ör. ürün ekleme/güncelleme/silme) public adreslerde hiç bulunmaz. Ayrı bir .NET projesi açılmadı: ortak kod (kurallar, veritabanı) tek projede kalsın diye. Build sırasında üretilen `openapi.json` admin adreslerini her zaman içerir (api-client'ta hook'lar olsun diye).
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
- **Localization:** `Accept-Language` ile tr (varsayılan) / en. Validasyon mesajları, alan adları ve hata açıklamaları `Resources/Localization/Messages*.resx` dosyalarında; kodda metin yok.
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
- Çıktı etiket bazlı (`tags-split`): `@ako/api-client/<etiket>` (hook'lar), `/model` (tipler), `/zod/<etiket>`.
- Tek fetch katmanı (`client.ts`): `configureApiClient` ile adres, dil (`Accept-Language`) ve token deposu verilir. Web BFF'te token yok (cookie), mobilde `TokenStore` + 401'de otomatik refresh (tek uçuş).
- Hatalar `ApiError` (`status`, `code`, `fieldErrors`); `applyFieldErrors` react-hook-form'a bağlar.
- API'de JSON sayıları katı (`NumberHandling.Strict`) ve sorgu parametreleri camelCase; aksi hâlde üretilen tipler `number | string` ve `Page` olurdu. Identity endpoint'lerine ad verildi (`useLogin`, `useRegister`…).

## Web: `apps/web/<ürün>`

- **React Router 8** framework modu: Vite, SSR, loader/action. (İlk kararda v7 yazıyordu; kurulumda güncel major 8'di.)
- **Hono** BFF rolünde (`react-router-hono-server`, ortak kod `packages/web-core`): token'lar şifreli httpOnly çerezde, `/api/*` .NET'e token sunucuda eklenerek iletilir, 401'de sunucuda yenilenir. Tarayıcı .NET'e hiç erişmez, CORS gerekmez. Backoffice BFF'i yalnızca Admin rolünü içeri alır.
- **Node 24 LTS** (adaptör 24.19+ istiyor). Bun daha sonra düşünülebilir; Hono'da bu yalnızca adaptör değişikliğidir.
- mari-ui (`@mari-ui/components`) npm'den gelir; Tailwind v4 ile. `@mari-ui/modules` henüz npm'de yok, adapter deseni bekliyor.
- Uygulama içi yapı özellik bazlı: `app/features/<özellik>/{pages,components,hooks}`, adresler `app/routes.ts`'te tek yerde (Next tarzı klasör = adres yerine; API'deki Features yapısıyla aynı mantık).
- Ortak web bileşenleri `packages/ui` (form alanları, giriş formu, sağlayıcılar).
- Cache: herkese açık sayfalarda `Cache-Control` + CDN (`stale-while-revalidate`), oturum açıksa `private, no-store`.
- Veri: herkese açık/SEO → loader; kullanıcıya özel/etkileşimli → TanStack Query.
- **Kural:** iş mantığı loader'lara yazılmaz. Mantık .NET'te, çağrılar `api-client` üzerinden yapılır. Böylece web framework'ü yapının en ince ve en kolay değiştirilen katmanı olarak kalır.
- Hassas formlar `method="post"`: JS yüklenmezse veri URL'ye yazılmaz.
- Next.js'in seçilmeme sebebi: sık çıkan güvenlik açıkları (RSC, Server Actions, middleware) ve düşük RPS.

## Tasarım ve örnek senaryo

- Şablon gerçekçi bir senaryoyla gelir: **Akı Kahve**, butik bir kahve kavurucusu. Site = vitrin (katalog, ürün detayı, alışveriş listesi); backoffice = ürün ve müşteri yönetimi. Todos örneği bu senaryoda "alışveriş listem"dir. Projeye başlarken senaryo silinir, yapı kalır.
- Stil: "Nature Distilled" (toprak tonları, yumuşak gölge, el yapımı sıcaklık). Renk: kahve `#92400E` + terracotta vurgu `#C67B5C`, krem yüzeyler. Tipografi: başlık Playfair Display, gövde Inter (backoffice'te ikisi de Inter). Seçimler ui-ux-pro-max tasarım veritabanından (Bakery/Cafe paleti, artisan stil).
- Tema mari-ui'ın kendi sistemiyle: `packages/ui/themes/<uygulama>/mari-ui.config.json` → `pnpm --filter @ako/ui theme` → tema CSS'i (kontrastlar AA'ya göre otomatik). mari-ui yapılandırması nötr renkleri değiştiremediği için sıcak nötrler `themes/warm-neutrals.css` ile ezilir (kontrastlar dosyada belgeli).
- Site `editorial` kişilik, rahat boşluk, büyük köşe; backoffice `corporate`, sıkı boşluk (yoğun tablolar).
- Fontlar `@fontsource` ile uygulamaya gömülü (Google Fonts'a istek yok). İkonlar lucide (emoji yok).
- Ürün modeli: kategori (enum, JSON'da metin) + görsel adresi. Örnek görseller API'nin `wwwroot/images`'ında (SVG); web'de BFF üzerinden `/api/images/...`. Gerçek projede yüklenen fotoğraflar gelir.

## Mobil: `apps/mobile`

- Expo + `@mari-ui/native`.
- .NET'e doğrudan bağlanır, bearer token SecureStore'da tutulur.
- Sosyal giriş: tarayıcı akışı (`AuthSession` + `ako://` deep link) tüm sağlayıcılar için; Google ve Apple'da ek olarak native SDK ile id token gönderilebilir.

## Altyapı ve güvenlik

- Docker Compose: Postgres + Mailpit (yerel SMTP, `localhost:8025`) + Aspire Dashboard (`localhost:18888`) + api (`--profile app`) + web.
- API Dockerfile: çok aşamalı, root olmayan kullanıcı, 8080. Sağlık kontrolü ortamda: `/health/live`, `/health/ready`.
- Loglama: **Serilog** (dev'de konsol, diğer ortamlarda JSON). İzleme: **OpenTelemetry**, OTLP ile dışa aktarım; hedef araç projeye göre.
- Rate limiting: .NET yerleşik; `/auth` POST'ları IP başına dakikada 10.
- Denetim alanları (`IAuditable`) EF interceptor ile otomatik. DataProtection anahtarları veritabanında.
- E-posta: SMTP (MailKit). Sağlayıcıya bağlı değil; ayardan değişir.
- Renovate/Dependabot. CI'da `pnpm audit` ve `dotnet list package --vulnerable` çalışır.
- `@mari-ui/modules` adapter deseni: modüllerin arayüzleri `api-client` ile doldurulur.

## Kurulum sırasında konuşulacaklar

- ~~Form yönetimi~~ → **react-hook-form + Orval'ın ürettiği zod şemaları** (karar verildi).
- ~~Testler~~ → **xUnit + Testcontainers** (.NET), **Vitest + Playwright** (web) (karar verildi).
- i18n gerekecek mi?
- Deploy hedefi: VPS + Docker mı, bulut servisi mi?
- create-ako-app'te hangi seçenekler olacak (auth sağlayıcıları, i18n…)?
