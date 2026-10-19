# ako-starter

Web, mobil ya da ikisini birden içeren projeler için başlangıç şablonu: .NET 10 API + React Router 8/Hono web uygulamaları
(+ ileride Expo mobil) + [mari-ui](https://github.com/aykutyilmaz37). Örnek senaryo: **Akı Kahve**.

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
