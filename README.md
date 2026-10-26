# ako-starter

Web, mobil ya da ikisini birden içeren projeler için başlangıç şablonu: .NET 10 API, React Router 8 + Hono web uygulamaları (site ve backoffice), Expo mobil uygulama ve [mari-ui](https://github.com/tfcs-istanbul/mari-ui) tasarım sistemi. Örnek senaryo: **Akı Kahve** (kahve dükkânı: katalog, alışveriş listesi, yönetim paneli).

## Yeni proje

```bash
npx create-ako-app@latest yeni-proje
```

Web / mobil / ikisi, backend, auth, misafir girişi, sosyal giriş, örnek senaryo ve çoklu dil sorulur; seçilmeyen parçalar çıkarılır, kurulum ve ilk commit yapılır. Sorusuz kullanım ve tüm seçenekler: [packages/create-ako-app](packages/create-ako-app/README.md).

## İçindekiler

| Klasör                    | Ne                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `apps/api`                | .NET 10 API: Identity (e-posta kodu, misafir, sosyal giriş), PostgreSQL + EF Core, çoklu dil, rate limiting, OpenTelemetry |
| `apps/web/site`           | Herkese açık site (React Router 8, SSR, Hono BFF, Tailwind + mari-ui)                                                      |
| `apps/web/backoffice`     | Yönetim paneli (yalnızca Admin rolü): kullanıcılar, ürünler, çeviriler                                                     |
| `apps/mobile`             | Expo (SDK 57) mobil uygulama, `@mari-ui/native`                                                                            |
| `packages/api-client`     | OpenAPI'den üretilen tipli istemci (Orval): fetch, TanStack Query hook'ları, zod şemaları                                  |
| `packages/web-core`       | Web uygulamalarının ortak BFF'i: şifreli oturum çerezi, API proxy'si, token yenileme                                       |
| `packages/e2e`            | Playwright duman testleri                                                                                                  |
| `packages/create-ako-app` | Bu şablondan proje üreten CLI (npm'de yayında)                                                                             |

Kararlar için [DECISIONS.md](DECISIONS.md), sıra ve durum için [ROADMAP.md](ROADMAP.md), güvenlik için [SECURITY.md](SECURITY.md).

## Gereksinimler

Node 24.19+, pnpm (`corepack enable`), .NET 10 SDK, Docker.

## Çalıştırma

```bash
pnpm install
pnpm db:up                              # Postgres + Mailpit + Aspire Dashboard (Docker)
pnpm --filter @ako/api dev              # API: http://localhost:5165
pnpm --filter @ako/web-site dev         # http://site.localhost:5173
pnpm --filter @ako/web-backoffice dev   # http://admin.localhost:5174  (admin@ako.local / Admin123!)
pnpm --filter @ako/mobile dev           # Expo (i: iOS simülatörü)
```

Ayrıntılar: [apps/api](apps/api/README.md), [apps/web](apps/web/README.md), [apps/mobile](apps/mobile/README.md).

## Doğrulama

```bash
pnpm generate:check && pnpm typecheck && pnpm lint && pnpm build && pnpm test   # birim + API testleri
pnpm --filter @ako/e2e install:browsers && pnpm --filter @ako/e2e test:e2e       # duman testi (db + servisler gerekir)
pnpm --filter create-ako-app verify                                              # şablonun tüm kombinasyonları (yavaş)
```

CI (`.github/workflows/ci.yml`) ilk iki satırı her PR'da çalıştırır.

## Deploy

Tek sunucu (VPS) + Docker için örnek: [compose.prod.yaml](compose.prod.yaml) (Postgres, migrate, API, site, backoffice).

```bash
cp .env.prod.example .env.prod   # değerleri doldurun
docker compose -f compose.prod.yaml --env-file .env.prod up -d --build
```

İmajlar: `apps/api/Dockerfile`, `apps/web/Dockerfile` (`--build-arg APP=site|backoffice`); derleme bağlamı repo kökü. Migration, gizli bilgiler ve HTTPS notları dosyaların başında.

## Şablonu değiştirirken

Üretilen projeleri etkileyen her PR bir changeset taşır; birleşince `create-ako-app`'in yeni sürümü otomatik yayınlanır (npmjs.com'da onayla):

```bash
pnpm --filter create-ako-app changeset
```

Ayrıntı: [packages/create-ako-app/RELEASING.md](packages/create-ako-app/RELEASING.md).
