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
- .NET 10 Minimal API, özellik bazlı klasörler (`Features/<Özellik>/`).
- PostgreSQL + EF Core (Npgsql), code-first migration'lar.
- Hatalar her zaman **ProblemDetails** (RFC 9457) formatında döner. Alan hataları mari-ui `Field` bileşenine bağlanır.
- Validasyon: **FluentValidation** (şirket standardı). Kurallar OpenAPI'ye kendiliğinden yansımadığı için istemcideki zod şemaları yalnızca tip ve zorunluluk bilgisini taşır; asıl kural kontrolü sunucuda yapılır, hatalar ProblemDetails ile döner.
- Auth: **ASP.NET Core Identity** + sosyal girişler (Google, Apple, Facebook…). Başka bir sosyal giriş varsa iOS'ta Apple girişi zorunludur.

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
- Sosyal giriş cihazda yapılır, alınan id token .NET'e gönderilir; .NET doğrulayıp kendi token'ını verir.

## Altyapı ve güvenlik
- Docker Compose: Postgres + api + web.
- Renovate/Dependabot. CI'da `pnpm audit` ve `dotnet list package --vulnerable` çalışır.
- `@mari-ui/modules` adapter deseni: modüllerin arayüzleri `api-client` ile doldurulur.

## Kurulum sırasında konuşulacaklar
- ~~Form yönetimi~~ → **react-hook-form + Orval'ın ürettiği zod şemaları** (karar verildi).
- ~~Testler~~ → **xUnit + Testcontainers** (.NET), **Vitest + Playwright** (web) (karar verildi).
- i18n gerekecek mi?
- Loglama ve izleme: Serilog, OpenTelemetry.
- Deploy hedefi: VPS + Docker mı, bulut servisi mi?
- create-ako-app'te hangi seçenekler olacak (auth sağlayıcıları, i18n…)?
