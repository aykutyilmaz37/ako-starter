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
  packages/web-core     ortak BFF (Hono) kurulumu: session cookie, auth, API'ye token ekleme
  packages/shared       ortak TS yardımcıları
  ```
- **Birden fazla web ürünü / backoffice:** aynı monorepoda `apps/web/` altında ayrı uygulamalar; ayrı build, ayrı domain, ayrı deploy. Tek uygulamada sayfa grupları olarak tutulmaz (müşteri paketine admin kodu girmez, biri diğerini yeniden yayınlatmaz). Ayrı repo yalnızca ayrı ekip/takvim ya da zorunlu ağ ayrımı varsa.
- Geliştirmede her web uygulaması kendi alan adında (`site.localhost:5173`, `admin.localhost:5174`): çerezler production'daki gibi tamamen ayrı.
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
- Ortak bir UI paketi yok: her uygulama mari-ui'ı doğrudan kullanır. Formlar `Controller` + mari-ui `Field`'ı kendi içinde kurar; uygulamaya özel yardımcılar `app/shared`'da. Importlar `~/…` alias'ıyla (app/); üst klasöre çıkan (`../`) import yok.
- Cache: herkese açık sayfalarda `Cache-Control` + CDN (`stale-while-revalidate`), oturum açıksa `private, no-store`.
- Veri: herkese açık/SEO → loader; kullanıcıya özel/etkileşimli → TanStack Query.
- **Kural:** iş mantığı loader'lara yazılmaz. Mantık .NET'te, çağrılar `api-client` üzerinden yapılır. Böylece web framework'ü yapının en ince ve en kolay değiştirilen katmanı olarak kalır.
- Hassas formlar `method="post"`: JS yüklenmezse veri URL'ye yazılmaz.
- Next.js'in seçilmeme sebebi: sık çıkan güvenlik açıkları (RSC, Server Actions, middleware) ve düşük RPS.

## Çoklu dil

- Diller: **tr (varsayılan), en, de**. Yenisi backoffice'ten eklenir (kod + ad) ve açılıp kapanır; varsayılan dil kapatılamaz.
- **Model "dosya + tablo üstüne yazar":** varsayılan metinler koddaki dosyalardır (`apps/web/<uygulama>/app/locales/<dil>.json`, düz dosya, noktalı anahtar: `home.hero.title`; API metinleri `Messages.resx`). Veritabanındaki çeviri tablosu dosyanın üstüne yazar; admin değişikliği dağıtım gerektirmez, "ezmeyi sil" dosyadaki değere döner. API dosyaları derlemede gömer. Dosyada olmayan anahtar tabloda çevrilemez (`key_not_found`): yeni anahtar önce `tr.json`'a eklenir.
- Web metinleri de aynı tablodan gelir: `GET /localization/{dil}/{alan}` (alan: `site` | `backoffice` | `api`; ETag + Cache-Control) ve `GET /localization/languages`. Web sunucusu sözlüğü bellekte kısa süre tutar, süre dolunca ETag ile kontrol eder; API'ye ulaşılamazsa gömülü JSON'a düşer. Sözlük root loader'dan gelir, anahtarlar `tr.json`'dan türediği için olmayan anahtar derleme hatası verir.
- **Site dili adreste:** varsayılan dil önek almaz (`/products`), diğerleri alır (`/en/products`, `/de/products`); `routes.ts`'te isteğe bağlı `:lang?` segmenti. `/tr/...` öneksiz adrese 301 yapar, bilinmeyen/kapalı dil 404 verir. `<html lang>`, `hreflang` alternatifleri ve API çağrılarında `Accept-Language` adresteki dilden gelir. Dil seçici (bayrak + ad) aynı sayfanın diğer dildeki adresine düz bağlantıdır; açık dil 1 ise görünmez.
- **Backoffice dili çerezde** (`ako_lang`): adresler dilsizdir, seçici başlıktadır. "Çeviriler" sayfası yalnızca site metinlerini yönetir (backoffice ve api metinleri dosyadan gelir, arayüzde düzenlenmez): arama, tek "Kaydet" ile toplu kaydetme, "yalnızca eksikler", dil sütunları, satır içi düzenleme, dil ekleme/aç-kapat, dışa aktarma.
- Veri (ürün adı/açıklaması) çevrilmez; yalnızca arayüz metinleri çevrilir. Para birimi TL kalır, gösterim biçimi dile göre değişir.
- **create-ako-app "Çoklu dil olsun mu?" diye sorar.** Hayırsa yalnızca varsayılan dil kalır: dil seçici, çeviri tablosu ve "Çeviriler" sayfası (`features/localization`) silinir; `t()` anahtarları tek dosyadan çözülmeye devam eder, `:lang?` segmenti ve `/localization` endpoint'leri çıkarılır.
- **Mobil metinleri** de aynı modeldedir: dördüncü alan `mobile` (`GET /localization/{dil}/mobile`), varsayılanlar `apps/mobile/locales/*.json` (API'ye gömülür, `TranslationNamespaces.Mobile`). Uygulama aynı dosyaları paketler: ilk açılışta ve API'ye ulaşılamazken onlar, çevrimiçiyken sözlük üstüne yazar. Dil seçimi cihazda (SecureStore) tutulur, yoksa cihaz dili; `Accept-Language` buradan gider. "Çeviriler" sayfası yalnızca site metinlerini yönetir.
- **Tema tercihi** (sistem / açık / koyu): web'de `ako_theme` çerezi ve `<head>`'de satır içi betik (`@ako/web-core/theme`; sunucuda yazılmaz, çünkü herkese açık sayfalar CDN'de ortak önbelleğe alınır), mobilde SecureStore. mari-ui teması `[data-theme]` / `prefers-color-scheme` ile zaten iki modu taşır.
- Bilinen sınır: sosyal girişten dönüş (`/bff/external/callback`) varsayılan dildeki ana sayfaya düşer.

## Tasarım ve örnek senaryo

- Şablon gerçekçi bir senaryoyla gelir: **Akı Kahve**, butik bir kahve kavurucusu. Site = vitrin (katalog, ürün detayı, alışveriş listesi); backoffice = ürün ve müşteri yönetimi. Todos örneği bu senaryoda "alışveriş listem"dir. Projeye başlarken senaryo silinir, yapı kalır.
- Stil: "Nature Distilled" (toprak tonları, yumuşak gölge, el yapımı sıcaklık). Renk: kahve `#92400E` + terracotta vurgu `#C67B5C`, krem yüzeyler. Tipografi: başlık Playfair Display, gövde Inter (yalnız sitede). Seçimler ui-ux-pro-max tasarım veritabanından (Bakery/Cafe paleti, artisan stil).
- Tema mari-ui CLI'ıyla: her uygulamanın kökünde `mari-ui.config.json` → `pnpm theme` → `mari-ui-theme.css` (kontrastlar AA'ya göre otomatik). Sıcak nötrler config'te `color.tokens` ile (mari-ui 0.3.0); ayrı ezme dosyası yok. Backoffice mari-ui'ın varsayılan temasında (iris).
- AI kuralları mari-ui CLI'ından (`init`/`sync`): her uygulamada `CLAUDE.md`, `.claude/skills/mari-ui`, `AGENTS.md`, `GEMINI.md`, Cursor ve Copilot dosyaları. Elle düzenlenmez; mari-ui güncellenince `pnpm ai-rules`.
- Site `editorial` kişilik, rahat boşluk, büyük köşe; backoffice varsayılan tema.
- Fontlar yerel: site `@fontsource`, backoffice mari-ui'ın kendi font dosyaları (Google Fonts'a istek yok). İkonlar lucide (emoji yok).
- CSS `links()` ile `<head>`'e `<link>` olarak girer (yan etki importu geliştirmede sayfanın bir an stilsiz görünmesine, titremeye yol açıyordu).
- Ürün modeli: kategori (enum, JSON'da metin) + görsel adresi. Örnek görseller API'nin `wwwroot/images`'ında (SVG); web'de BFF üzerinden `/api/images/...`. Gerçek projede yüklenen fotoğraflar gelir.

## Mobil: `apps/mobile`

- Expo + `@mari-ui/native`.
- .NET'e doğrudan bağlanır, bearer token SecureStore'da tutulur.
- Sosyal giriş: tarayıcı akışı (`AuthSession` + `ako://` deep link) tüm sağlayıcılar için; Google ve Apple'da ek olarak native SDK ile id token gönderilebilir.

## Misafir ve kimlik (tüm istemciler)

- **API istemciyi ayırt etmez, yalnızca bearer token'a bakar.** Mobil token'ı kendisi gönderir, web'de BFF çerezdeki token'ı sunucuda ekler. Mobil için ayrı endpoint açılmaz.
- **Misafir = anonim Identity kullanıcısı.** `POST /auth/guest` e-postasız, şifresiz bir `AppUser` oluşturur (rol `Guest`) ve normal girişle aynı access + refresh token'ı döner. Mobil açılışta token yoksa misafir olur; bundan sonra her istek bearer'lıdır. Web'de gerekirse BFF aynı uçla misafir oturumu açar.
- **Hangi özelliğin misafire açık olduğu özellik kararıdır, endpoint'te policy ile seçilir:**
  - `RequireAuthorization()`: token'ı olan herkes (misafir dahil).
  - `AppPolicies.Member`: kayıtlı kullanıcı (`Guest` rolü değil). Yeni kişisel uçların varsayılanı budur (güvenli taraf).
  - `AppPolicies.Admin`: yönetim.
- **Herkese açık okuma uçları anonim kalır** (token varsa kullanılır): web sitesi bu uçları SEO ve CDN önbelleği için token'sız çağırır.
- **Misafirden üyeliğe geçiş veriyi korur:**
  - Kayıt (ya da sosyal/native giriş) misafir token'ıyla gelirse yeni kullanıcı açılmaz; aynı kayda e-posta/şifre ya da dış giriş bağlanır, rol `User` olur, veri yerinde kalır.
  - Misafir **var olan** bir hesaba giriş yaparsa her özellik kendi misafir verisini o hesaba taşır: `Common`'daki `IGuestDataMerger` arayüzünü özellikler uygular, Auth hepsini DI'dan alıp çalıştırır, sonra misafir kaydı silinir. Auth özellikleri, özellikler birbirini tanımaz (ArchTests). Çakışma kuralı (birleştir / üzerine yaz / at) özelliğin kendi kararıdır.
- **Temizlik:** belirli süre işlem görmeyen misafirler arka plan işiyle silinir (`Auth:Guest:RetentionDays`, varsayılan 30). `/auth/guest` IP başına rate limit'lidir.
- iOS Keychain uygulama silinince temizlenmeyebilir: eski misafir token'ı geçersizse istemci sessizce yeni misafir alır.
- **Reddedilenler:** uygulamaya gömülü anahtar / client credentials (mobil uygulamadan her sır çıkarılabilir); herkese açık uçlara token zorunluluğu (web'in önbelleğini ve SEO'sunu bozar). "İstek gerçekten bizim uygulamadan mı" sorusu misafir token'ıyla çözülmez; gerekirse App Attest (iOS) / Play Integrity (Android) eklenir.
- create-ako-app auth sorusunun altında "misafir girişi olsun mu?" diye sorar.

## Backend'siz mobil (yalnız mobil kombinasyonu)

Her mobil uygulamanın sunucuya ihtiyacı yoktur: veri yalnızca cihazda durabilir, uygulama internete yalnızca reklam, analitik, uzaktan ayar gibi üçüncü taraf servisler için çıkar. Şablon bunu ayrı bir kombinasyon olarak destekler; uygulama türü (liste, takip, oyun, araç...) fark etmez.

- create-ako-app "Backend: API / yok (cihazda veri)" diye sorar. "Yok" yalnızca **yalnız mobil** seçildiğinde sunulur (web BFF'i API'ye bağlıdır). Seçilirse `apps/api`, `packages/api-client`, `packages/web-core` silinir; auth, misafir, sosyal giriş ve API sözlüğü soruları sorulmaz.
- **Veri: `expo-sqlite` + Drizzle ORM.** Tipli şema, `drizzle-kit` ile üretilen ve uygulamaya paketlenen migration'lar, `useLiveQuery` ile veri değişince kendiliğinden güncellenen ekranlar. Küçük ayarlar için anahtar-değer (`expo-sqlite/kv-store` ya da SecureStore). Veritabanı tek dosyadır ve işletim sisteminin otomatik yedeğine girer.
- **Yapı API'li sürümle aynı mantıkta:** `features/<özellik>/data/` (şema, sorgular, hook'lar); ekranlar yalnızca hook kullanır. API ile yerel veri arasında otomatik geçiş yapan ortak bir soyutlama **yoktur**: seçim üretimde bir kez yapılır, iki yolu da taşıyan kod karmaşası olmaz.
- Metinler paketli JSON'lardan (`locales/`), tema ve dil tercihi cihazda.
- Örnek senaryo bu kombinasyonda: salt okunur içerik (ör. katalog) paketli JSON, kullanıcının ürettiği veri (ör. liste) SQLite.
- **Backend gerektirmeyen ama internet isteyen modüller** (her iki kombinasyonda da ayrı create-ako-app seçenekleri):
  - Reklam: AdMob (`react-native-google-mobile-ads`). Expo Go'da çalışmaz, geliştirme derlemesi (EAS) gerekir.
  - Rıza: iOS ATT izni + AB için reklam rızası (Google UMP). Reklam seçilirse zorunlu.
  - Analitik: Firebase / GA4 veri katmanı.
  - Uzaktan ayar ve zorunlu güncelleme: Firebase Remote Config ya da CDN'deki statik bir JSON.

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
- ~~i18n gerekecek mi?~~ → **çoklu dil var** (bkz. "Çoklu dil"; karar verildi).
- Deploy hedefi: VPS + Docker mı, bulut servisi mi?
- create-ako-app'te hangi seçenekler olacak (auth sağlayıcıları…; çoklu dil, misafir, backend'siz mobil ve reklam/analitik soruları yukarıdaki bölümlerde)?
