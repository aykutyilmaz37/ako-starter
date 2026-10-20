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
  - Sayfa isteklerinde (SSR) loader'lar API'yi proxy'siz çağırdığı için 401 yenilemesi orada çalışmaz; bu yüzden çerezde access token'ın bitişi (`expiresAt`, giriş yanıtındaki `expiresIn`'den) de tutulur ve süresi dolmak üzere olan token loader'lardan önce yenilenir, yenilenemezse çerez silinir. Token'lar Identity'nin opak bearer token'larıdır (JWT değil): tek doğrulayan API olduğu ve tarayıcı token görmediği için JWT'nin bir getirisi yok; ikinci bir servis token doğrulamak zorunda kalırsa yeniden düşünülür.
  - Girişli kullanıcıyı `/login`'den uzaklaştırma kararı çerezin varlığına değil `/me` sonucuna bakar (backoffice'te kök loader'da). Çerez var ama geçersizse iki yön birbirine yönlendirip döngüye giriyordu.
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
- **Feature-tabanlı yapı:** `features/<özellik>/{data,components,lib}` (auth, catalog, shopping-list, localization, theme); ortak bileşenler `shared/components/`, altyapı `shared/lib/` (`api`, `config`, `prefs`, `brand`). Ekranlar (`app/`) yalnızca özelliklerin hook ve bileşenlerini kullanır; API çağrıları `data/hooks.ts` arkasındadır (web `features/` düzeniyle aynı mantık). Sonucu: create-ako-app'te ürün ve liste hook importları işaretsizdir (backend’siz sürüm aynı yolları kullanır), `features/catalog/data/{hooks,images,schema}.ts` ve `features/shopping-list/data/hooks.ts` dosyalarını `variants/no-backend/` değiştirir; auth kapalıyken `features/auth` ve `features/shopping-list` klasörleri silinir (`AUTH_PATHS`).

## Misafir ve kimlik (tüm istemciler)

- **API istemciyi ayırt etmez, yalnızca bearer token'a bakar.** Mobil token'ı kendisi gönderir, web'de BFF çerezdeki token'ı sunucuda ekler. Mobil için ayrı endpoint açılmaz.
- **Misafir = anonim Identity kullanıcısı.** `POST /auth/guest` e-postasız, şifresiz bir `AppUser` oluşturur (rol `Guest`) ve normal girişle aynı access + refresh token'ı döner. Mobil açılışta token yoksa misafir olur; bundan sonra her istek bearer'lıdır. Web'de gerekirse BFF aynı uçla misafir oturumu açar.
- **Hangi özelliğin misafire açık olduğu özellik kararıdır, endpoint'te policy ile seçilir:**
  - `RequireAuthorization()`: token'ı olan herkes (misafir dahil).
  - `AppPolicies.Member`: kayıtlı kullanıcı (`Guest` rolü değil). Yeni kişisel uçların varsayılanı budur (güvenli taraf).
  - `AppPolicies.Admin`: yönetim.
- **Herkese açık okuma uçları anonim kalır** (token varsa kullanılır): web sitesi bu uçları SEO ve CDN önbelleği için token'sız çağırır.
- **Misafirden üyeliğe geçiş veriyi korur ("claim" modeli):**
  - Kayıt, e-posta/şifre girişi, sosyal ve native giriş **olduğu gibi çalışır**; hiçbiri misafiri tanımaz. Misafirken alınan refresh token'ı istemci saklar; kayıtlı kullanıcı olunca `POST /auth/guest/claim { guestRefreshToken }` çağırır (yalnızca `Member`).
  - Sunucu token'ı çözer (süre, `Guest` rolü doğrulanır), her özelliğin `IGuestDataMerger.MergeAsync(guestId, targetUserId)` kancasını çalıştırır, sonra misafiri siler. Misafirin sahibi olduğunu refresh token'ın kendisi kanıtlar; hedef her zaman çağıran kullanıcıdır.
  - Neden filtre/kanca yerine ayrı uç: giriş yanıtı (özellikle Identity'nin hazır `/login`'i) istemciye dönmeden veri taşınmış olmalıydı; ayrı uçta yarış yoktur, kayıt → kod doğrulama → giriş arasında uygulama kapansa bile istemci token'ı saklar ve sonra talep eder, tüm giriş yolları aynı kuralı kullanır. Talep tekrarlanırsa başarılı sayılır (idempotent).
  - `Common.IGuestDataMerger` özelliklerce uygulanır (Auth hepsini DI'dan alır, hiçbirini tanımaz; ArchTests sınırları korur). Çakışma kuralı (birleştir / üzerine yaz / at) özelliğin kendi kararıdır; `Todos` örneği görevlerin sahibini değiştirir.
- **Temizlik:** belirli süre görülmeyen misafirler verileriyle birlikte (`IGuestDataMerger.DeleteAsync`) arka plan işiyle silinir (`Auth:Guest:RetentionDays`, varsayılan 30; "son görülme" mobilin açılışta çağırdığı `/auth/me` ile en fazla günde iki kez güncellenir). `/auth/guest` `/auth` grubunun IP başına rate limit'indedir (NAT arkasında çok kullanıcılı ağlarda gerekirse `RateLimiting:Auth:PermitLimit` yükseltilir).
- iOS Keychain uygulama silinince temizlenmeyebilir: eski misafir token'ı geçersizse istemci sessizce yeni misafir alır.
- **Reddedilenler:** uygulamaya gömülü anahtar / client credentials (mobil uygulamadan her sır çıkarılabilir); herkese açık uçlara token zorunluluğu (web'in önbelleğini ve SEO'sunu bozar). "İstek gerçekten bizim uygulamadan mı" sorusu misafir token'ıyla çözülmez; gerekirse App Attest (iOS) / Play Integrity (Android) eklenir.
- Misafir hesabın e-postası/şifresi yoktur: `AppPolicies.Member` ister uçlar (ör. e-posta değiştirme) misafire 403 döner. Güvenlik varsayılanı: yeni kişisel uçlar `Member` ile başlar, misafire açmak bilinçli bir karardır (`Todos` örneği açıktır).
- Mobil: açılışta token yoksa otomatik misafir; çıkış yeni misafir başlatır; token geçersizse (kullanıcı silinmiş) sessizce yeni misafir.
- create-ako-app auth sorusunun altında "misafir girişi olsun mu?" diye sorar.

## Backend'siz mobil (yalnız mobil kombinasyonu)

Her mobil uygulamanın sunucuya ihtiyacı yoktur: veri yalnızca cihazda durabilir, uygulama internete yalnızca (eklenirse) üçüncü taraf servisler için çıkar. Şablon bunu ayrı bir kombinasyon olarak destekler; uygulama türü (liste, takip, oyun, araç...) fark etmez.

- create-ako-app "Backend: API / yok (cihazda veri)" diye sorar. "Yok" yalnızca **yalnız mobil** seçildiğinde sunulur (web BFF'i API'ye bağlıdır). Seçilirse `apps/api`, `packages/api-client`, `packages/web-core` silinir; auth, misafir, sosyal giriş ve API sözlüğü soruları sorulmaz.
- **Veri: `expo-sqlite` + Drizzle ORM.** Tipli şema, `drizzle-kit` ile üretilen ve uygulamaya paketlenen migration'lar, `useLiveQuery` ile veri değişince kendiliğinden güncellenen ekranlar. Küçük ayarlar için anahtar-değer (`expo-sqlite/kv-store` ya da SecureStore). Veritabanı tek dosyadır ve işletim sisteminin otomatik yedeğine girer.
- **Yapı API'li sürümle aynı mantıkta:** `features/<özellik>/data/` (şema, sorgular, hook'lar); ekranlar yalnızca hook kullanır. API ile yerel veri arasında otomatik geçiş yapan ortak bir soyutlama **yoktur**: seçim üretimde bir kez yapılır, iki yolu da taşıyan kod karmaşası olmaz.
- Metinler paketli JSON'lardan (`locales/`), tema ve dil tercihi cihazda.
- Örnek senaryo bu kombinasyonda: salt okunur içerik (ör. katalog) paketli JSON, kullanıcının ürettiği veri (ör. liste) SQLite.

## Altyapı ve güvenlik

- Docker Compose: Postgres + Mailpit (yerel SMTP, `localhost:8025`) + Aspire Dashboard (`localhost:18888`) + api (`--profile app`) + web.
- API Dockerfile: çok aşamalı, root olmayan kullanıcı, 8080. Sağlık kontrolü ortamda: `/health/live`, `/health/ready`.
- Loglama: **Serilog** (dev'de konsol, diğer ortamlarda JSON). İzleme: **OpenTelemetry**, OTLP ile dışa aktarım; hedef araç projeye göre.
- Rate limiting: .NET yerleşik; `/auth` POST'ları IP başına dakikada 10.
- Denetim alanları (`IAuditable`) EF interceptor ile otomatik. DataProtection anahtarları veritabanında.
- E-posta: SMTP (MailKit). Sağlayıcıya bağlı değil; ayardan değişir.
- Renovate/Dependabot. CI'da `pnpm audit` ve `dotnet list package --vulnerable` çalışır.
- `@mari-ui/modules` adapter deseni: modüllerin arayüzleri `api-client` ile doldurulur.

## create-ako-app: üretim mekaniği

Şablon deponun kendisidir (ayrı bir şablon klasörü tutulmaz); üretici izlenen dosyaları kopyalar, seçilmeyeni çıkarır. Yayınlanınca `build:template` aynı dosyaları pakete `template/` olarak koyar.

- **Üç araç:** (1) yol silme (`src/plan.mjs`: seçilmeyen uygulama, özelliğe ait klasör/dosya), (2) satır işaretleri (`src/markers.mjs`), (3) hazır varyant dosyaları (`variants/<ad>/`, hedefin üstüne yazılır).
- **İşaretler** dosya türünden bağımsızdır; şablon işaretlerle de derlenir (hepsi yorum): `// ako:<özellik>` satırı siler, `ako:begin/ako:end` bloğu siler, `ako:else` ile kapalıyken geçerli kod `//~ ` (JSX'te `{/*~ ... */}`) önekiyle yazılır. Özellik açıkken dosyaya dokunulmaz.
- **Auth kapalı** (`--no-auth`): giriş, kayıt, misafir, sosyal giriş, `Todos` ve tüm `/admin` uçları çıkar; **backoffice de çıkar** (yönetim girişi auth ister, seçimle birlikte kullanılamaz). Site ve mobil katalog olarak salt okunur kalır.
- **Migration:** auth'lu set `Infrastructure/Data/Migrations`'ta, auth'suz set `variants/no-auth/` altında hazır durur (Identity tablolarını içermez); üretimde dotnet-ef gerekmez. Modeli değiştirince `pnpm --filter create-ako-app variants` ile yenilenir; `verify` betiği `has-pending-model-changes` ile bayat seti yakalar.
- **Üretim sonrası sıra:** install → `generate` (API değiştiyse openapi.json ve Orval çıktısı yeniden) → `format` → `git init` + ilk commit; böylece `generate:check` ve `format:check` baştan temiz.
- **Doğrulama:** `pnpm --filter create-ako-app verify` her kombinasyon için CLI'ın son adımlarını, sonra CI komutlarını (format:check, generate:check, typecheck, lint, build, test) çalıştırır.
- **Çoklu dil kapalı** (`--no-lang`): API'de `Features/Localization` (tablo, `/localization`, admin uçları), `Messages.en/de.resx` ve web/mobil `en`/`de` dosyaları çıkar; API metinleri yalnızca `Messages.resx`'ten, desteklenen kültür yalnızca `tr`. Web'de `:lang?` segmenti, `lang-layout`, dil seçici ve backoffice "Çeviriler" gider; `dictionary.server.ts` yalnızca gömülü varsayılan dosyayı okur (sözlük API'den gelmez). Mobil yalnızca `tr.json` paketler, dil seçici görünmez. `t()` anahtarları ve tür güvenliği aynen sürer. Dil değiştirme sınamasını içeren e2e paketi çıkar.
- **Backend'siz mobil** (`--no-backend`, yalnız mobil): `apps/api`, `packages/{api-client,web-core,shared,e2e}`, `compose.yaml`, CI'ın `api` işi, dependabot'un nuget/docker girdileri, kök `db:*`/`generate*` betikleri ve turbo `generate` görevi çıkar; auth kapalı sayılır (`ako:auth`), sözlük yalnızca paketli dosyalardan gelir. Mekanik:
  - Yeni işaretler: `backend` (API'ye bağlanan satırlar), türetilmiş `list` (alışveriş listesi: API'li sürümde giriş ister, backend'siz sürümde cihazdadır; yalnızca auth kapalı **ve** backend açıkken kapanır) ve `api-lang` (dil kapalı **ya da** backend yok: sözlük/dil listesi API'den çekilmez).
  - Ekranlar iki yolda da aynı hook adlarını (`useListProducts`, `useGetProduct`, `useAddToList`) ve aynı dönüş biçimini kullanır; yalnızca `import` satırı işaretle değişir, çalışma zamanında geçiş yoktur.
  - Yerel veri `variants/no-backend/` ile gelir: `features/catalog/data` (paketli `products.json`, görseller API'nin wwwroot'undan `assets/products`'a kopyalanır: `plan.copy`) ve `features/shopping-list/data` (Drizzle şeması, sorgular, `useLiveQuery` hook'u), `shared/lib/db.ts` + `shared/lib/database.tsx` (migration'ları açılışta uygular), `shared/lib/prefs.ts` (tema/dil için `expo-sqlite/kv-store`; API'li sürümde SecureStore).
  - Drizzle migration'ları `variants/no-backend/apps/mobile/drizzle/` altında hazır durur (inline-import babel eklentisi `.sql`'i pakete gömer). Şemayı değiştirince `pnpm --filter create-ako-app variants` (yalnız Drizzle: `--only=drizzle`) ile yenilenir; `verify` bayat seti yakalar (`drizzle-kit generate` "nothing to migrate" dememeli) ve `expo export` ile paketlemeyi sınar.
  - Katalog verisi `ProductSeed.cs` ile `products.json`'da iki kez durur; seed değişirse JSON elle güncellenir.
- **Misafir girişi kapalı** (`--no-guest`, auth açıkken): `CreateGuest`, `GuestAccounts`, `GuestCleanupService`, `IGuestDataMerger` (+ `TodoGuestData`), `GuestTests` çıkar; `AppUser.LastActiveAt` ve `Guest` rolü modelden kalkar, `Member` politikası yalnızca "giriş yapmış" olur. Mobilde `session.tsx` eski akışa döner: durum `anonymous` = token'sız (katalog açık), açılışta misafir açılmaz, claim yok; alışveriş listesi sekmesi anonimken yalnızca giriş davetini gösterir, ürün sayfasındaki "listeye ekle" anonimken `/login`'e gider (`list.login.*` metinleri). Oturum durumu adı iki yolda da `anonymous` / `member` (şablonda `anonymous` = misafir). Auth kapalıyken misafir de kapalıdır (`guest` işareti türetilir; sorulmaz).
- **Sosyal giriş kapalı** (`--no-social`, auth açıkken): API'de `ExternalLogin`, `NativeLogin`, `ExchangeCode`, `GetProviders`, `ExternalProviders`, `ExternalUserResolver`, `IdTokenValidator`, `LoginCodeStore`, sağlayıcı NuGet paketleri ve `Auth:Providers` / `Auth:AllowedReturnUrls` ayarları çıkar; `/auth/me` yanıtında `logins` boş döner (sözleşme değişmez). Web BFF'inden (`web-core`) `/bff/external/*`, `/api/auth/exchange` ve `/api/auth/native` çıkar; web/mobil sosyal düğmeler, `social-login.ts`, `packages/shared` (marka ikonları) ve mobilde `@react-native-google-signin/google-signin`, `expo-apple-authentication`, `expo-web-browser` bağımlılıkları gider. Sosyal giriş auth'un parçasıdır: auth/backend kapalıyken sorulmaz ve kapalıdır (`social` işareti, `guest` gibi). **Sağlayıcı bazında seçim yapılmaz**: sağlayıcılar zaten ayarla açılır (`ClientId` boşsa etkin olmaz); tek tek çıkarmak her sağlayıcı için ayrı paket/SDK/işaret demek olurdu, karşılığı yok. Veritabanı şeması değişmez (Identity `user_logins` tablosu kalır), yeni migration varyantı gerekmez. Yerelleştirme dosyalarındaki `auth.login.social` / `auth.error.external_failed` anahtarları (JSON, işaret taşımaz) kalır. Belge dosyaları (`apps/api/README.md`, `apps/web/README.md`) işaretlenmez; üretilen kök README bunu not eder.
- **Migration setleri** `variants/` altında (auth, misafir, örnek senaryo, dil) kombinasyonuna göre: `no-auth`, `no-guest`, `no-lang`, `no-auth-no-lang`, `no-guest-no-lang` ve bunların `-no-sample` karşılıkları (auth kapalıyken misafir ayrımı yok, ad `no-auth` kalır). Ek iki-seçenekli ayrım: e2e paketi yalnızca iki web uygulaması birlikte ve çoklu dil açıkken kalır.
- **Örnek senaryo kapalı** (`--no-sample`): API'de `Features/Products` ve `Features/Todos` (admin uçları dahil), `wwwroot/images`, `ProductSeed`, `ProductsTests`/`TodosTests`; site'ta katalog, ürün detayı, `todos`, ana sayfanın mağaza bölümleri (`home/components`: hero, faydalar, kategoriler, hikâye) ve `shared/{catalog,section-heading}`; backoffice'te ürün yönetimi ve stok uyarıları; mobilde mağaza/liste sekmeleri, ürün sayfası, `features/{catalog,shopping-list}` çıkar. Geriye **boş iskelet** kalır: auth, çoklu dil, kullanıcı yönetimi, çeviri yönetimi, başlık/altbilgi, hesap sayfası, sade bir ana sayfa (`home.hero.title/text`); dashboard yalnızca kullanıcı sayısı ve son kayıtları gösterir. Kararlar:
  - **Backend yokken kapatılamaz.** Backend'siz mobilin yerel veri katmanı (SQLite şeması, paketli katalog, alışveriş listesi) örnek senaryonun kendisidir; onsuz geriye anlamlı bir şey kalmaz (`normalizeChoices` hata verir, CLI sormaz).
  - **Markalama kalır.** "Akı Kahve" adı/metinleri (logo, `brand.*`, `home.hero.*`, altbilgi) örnek veri değil marka iskeletidir; kullanıcı değiştirir. README bunu söyler. `apps/*/README.md` içindeki Products/Todos anlatımları işaretlenmez (belge dosyaları işaretsiz, bkz. sosyal giriş kararı).
  - **Yeni işaretler:** `sample` (örnek senaryo kapalı) ve türetilmiş `todos` (auth **ya da** örnek kapalı: kullanıcıya özel veri yok). `list` artık örnek kapalıyken de kapanır. `Messages*.resx` satırları XML yorumu olarak işaretlenir (`<!-- ako:sample -->`, `.resx` işaretli uzantılara eklendi): ürün/todo hata metinleri ve `field.*` adları.
  - **İç içe else:** `//~` ile yazılan else kolunda iç içe `ako:begin/end` blokları artık desteklenir (iç bloğun satırları yine `//~` önekiyle yazılır; `markers.mjs`). Ana sayfa, dashboard ve mobil ana ekran else kolunda sade sürümü taşır.
  - **Yerelleştirme anahtarları** (düz noktalı JSON) için `localeRemove` var: `*` ile biten desen önek, diğerleri tam eşleşir; kapalı örnek senaryonun `products.*`, `todos.*`, `list.*`, `category.*`… anahtarları üç uygulamanın tüm dil dosyalarından silinir (kullanılmayan anahtar kalmaz; kullanım kalırsa `TranslationKey` tipi typecheck'te yakalar). API tarafı `.resx` işaretleriyle temizlenir.
  - **e2e paketi** yalnızca iki web uygulaması + çoklu dil + örnek senaryo açıkken kalır (testler ürün sayfalarını gezer).
  - **Migration setleri:** modelden Products/Todos tabloları çıkar, bu yüzden her (auth, misafir, dil) kombinasyonunun `*-no-sample` karşılığı var (altı yeni set: `no-sample`, `no-sample-no-lang`, `no-auth-no-sample`, `no-auth-no-sample-no-lang`, `no-guest-no-sample`, `no-guest-no-sample-no-lang`). Ad sırası: auth, misafir, sample, lang. `variants` betiği artık `--set=ad1,ad2` ile yalnız adı geçen EF setlerini yeniler (`--only=ef` hepsini yeni zaman damgasıyla yeniden üretir).

## Kurulum sırasında konuşulacaklar

- ~~Form yönetimi~~ → **react-hook-form + Orval'ın ürettiği zod şemaları** (karar verildi).
- ~~Testler~~ → **xUnit + Testcontainers** (.NET), **Vitest + Playwright** (web) (karar verildi).
- ~~i18n gerekecek mi?~~ → **çoklu dil var** (bkz. "Çoklu dil"; karar verildi).
- Deploy hedefi: VPS + Docker mı, bulut servisi mi? Henüz host/VPS yok; Aşama 4 bunu bekliyor.
- ~~create-ako-app'te hangi seçenekler olacak?~~ → mevcut sorularla kapandı (web/mobil, backend, auth, misafir, sosyal giriş, örnek senaryo, çoklu dil; ayrıntılar yukarıda).
- Her kombinasyonu CI'da otomatik üretip derlemek yapılmayacak (çok uzun sürüyor); yerelde `pnpm --filter create-ako-app verify` yeterli.
