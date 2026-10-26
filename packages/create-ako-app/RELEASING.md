# create-ako-app: geliştirme ve yayın

Bakımcılar için; npm sayfasında görünmez (paketin `files` alanında değil). Kullanım: [README.md](README.md).

Mekanik ve kararlar: kök [DECISIONS.md](../../DECISIONS.md) → "create-ako-app: üretim mekaniği".

## Geliştirme

```bash
pnpm --filter create-ako-app test                       # birim testler
pnpm --filter create-ako-app variants                   # model/şema değişince migration setlerini yenile (EF + Drizzle)
pnpm --filter create-ako-app verify --only=no-auth-site   # üret + CI komutları (yavaş; Docker gerekir)
pnpm --filter create-ako-app verify --only=no-backend     # dotnet gerekmez; Expo export dahil
```

Depodan çalıştırmak: `node packages/create-ako-app/bin/create-ako-app.mjs ../yeni-proje` (şablon olarak depo kullanılır).

Şablona özellik işareti eklerken: `src/markers.mjs` başındaki sözdizimi, silinecek yollar `src/plan.mjs`'te.

## Yayın

Otomatik, mari-ui ile aynı düzen: changesets + GitHub OIDC (trusted publishing, token yok) + taslak yayın.

1. Şablonda kullanıcıyı etkileyen her PR bir changeset taşır: `pnpm --filter create-ako-app changeset` (`0.x`'te kırıcı değişiklik `minor`, gerisi `patch`).
2. PR main'e birleşince `.github/workflows/release.yml` bir **"chore: sürüm paketleri"** PR'ı açar (sürüm + `CHANGELOG.md`).
3. O PR merge edilince paket npm'e **taslak** olarak yüklenir (`scripts/stage-release.mjs`, `npm stage publish`).
4. npmjs.com → **Staged Packages** → Approve (2FA) ile yayınlanır.

Şablon deponun **commit'lenmiş** dosyalarından üretilir (`git ls-files`). Pakette: `bin`, `src`, `variants`, `template/` (deponun kopyası; `.gitignore`'lar `_gitignore` adıyla, üretimde geri döner; prepack üretir, postpack siler), `LICENSE`. Kökteki `LICENSE`, `ROADMAP.md`, `.changeset/` ve `release.yml` üretilen projeye girmez. Yayından önce `pnpm --filter create-ako-app verify` ile tüm kombinasyonların geçtiğini doğrulayın.

### Bir kerelik kurulum (yapıldı: 2026-10-21)

- **İlk sürüm elle:** npm'de trusted publisher paket sayfasından tanımlandığı için paket önce var olmalı. `npm login`, sonra main'den `cd packages/create-ako-app && npm publish`.
- **Trusted publisher:** npmjs.com → `create-ako-app` → Settings → Trusted Publisher → GitHub Actions: org `tfcs-istanbul`, depo `ako-starter`, iş akışı `release.yml` (environment boş).
- **Token'ları kapat:** aynı sayfada Publishing access → "Require two-factor authentication and disallow tokens".
- **İş akışını aç:** GitHub → Settings → Secrets and variables → Actions → Variables → `RELEASE_ENABLED` = `true`. Ayrıca Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" açık olmalı (sürüm PR'ı için).
