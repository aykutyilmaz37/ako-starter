# ako-starter

Web, mobil ya da ikisini birden içeren projeler için başlangıç şablonu: .NET 10 API + React Router 8/Hono web uygulamaları

- Expo mobil + [mari-ui](https://github.com/aykutyilmaz37). Örnek senaryo: **Akı Kahve**.

## Yeni proje

```bash
npm create ako-app@latest yeni-proje
```

Web / mobil / ikisi, backend, auth, misafir, sosyal giriş, örnek senaryo ve çoklu dil sorulur; seçilmeyen parçalar çıkarılır.
Seçenekler: [packages/create-ako-app](packages/create-ako-app/README.md).

Kararlar için [DECISIONS.md](DECISIONS.md), sıra ve durum için [ROADMAP.md](ROADMAP.md), güvenlik için [SECURITY.md](SECURITY.md).

## Gereksinimler

Node 24.19+, pnpm, .NET 10 SDK, Docker.

## Çalıştırma

```bash
pnpm install
pnpm db:up                              # Postgres + Mailpit + Aspire Dashboard (Docker)
pnpm --filter @ako/api dev              # API: http://localhost:5165
pnpm --filter @ako/web-site dev         # http://site.localhost:5173
pnpm --filter @ako/web-backoffice dev   # http://admin.localhost:5174  (admin@ako.local / Admin123!)
```

Ayrıntılar: [apps/api](apps/api/README.md), [apps/web](apps/web/README.md).

## Doğrulama

```bash
pnpm generate:check && pnpm typecheck && pnpm lint && pnpm build && pnpm test   # birim + API testleri
pnpm --filter @ako/e2e install:browsers && pnpm --filter @ako/e2e test:e2e       # duman testi (db + servisler gerekir)
```

CI (`.github/workflows/ci.yml`) aynı adımları her PR'da çalıştırır.

## Deploy

Tek sunucu (VPS) + Docker için örnek: [compose.prod.yaml](compose.prod.yaml) (Postgres, migrate, API, site, backoffice).

```bash
cp .env.prod.example .env.prod   # değerleri doldurun
docker compose -f compose.prod.yaml --env-file .env.prod up -d --build
```

İmajlar: `apps/api/Dockerfile`, `apps/web/Dockerfile` (`--build-arg APP=site|backoffice`); derleme bağlamı repo kökü. Migration, gizli bilgiler ve HTTPS notları dosyaların başında.
