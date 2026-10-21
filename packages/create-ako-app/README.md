# create-ako-app

[ako-starter](https://github.com/aykutyilmaz37/ako-starter) şablonundan yeni proje üretir: .NET API, React Router web (site + backoffice), Expo mobil ve mari-ui; istenmeyen parçalar çıkarılır.

```bash
npm create ako-app@latest yeni-proje                                    # sorularla
npm create ako-app@latest yeni-proje -- -y --web=site --no-mobile --no-auth
npm create ako-app@latest mobil-proje -- -y --web=none --no-backend       # backend yok
```

(`pnpm create ako-app yeni-proje …` de olur; npm'de seçenekler `--`'dan sonra verilir.)

**Gereksinimler:** Node 24.19+, pnpm (`corepack enable`), API'li kombinasyonlarda .NET 10 SDK ve yerel veritabanı için Docker.

| Seçenek                      | Anlamı                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--web=site,backoffice,none` | Web uygulamaları                                                                                                                                    |
| `--mobile` / `--no-mobile`   | Expo mobil                                                                                                                                          |
| `--auth` / `--no-auth`       | Giriş, kayıt, misafir, Todos, yönetim (kapalıyken backoffice yok)                                                                                   |
| `--guest` / `--no-guest`     | Misafir girişi (varsayılan evet; auth kapalıyken yok): `/auth/guest`, temizlik işi, veri taşıma                                                     |
| `--social` / `--no-social`   | Sosyal giriş (varsayılan evet; auth kapalıyken yok): Google, Apple, GitHub… uçları, düğmeler, SDK'lar                                               |
| `--sample` / `--no-sample`   | Örnek senaryo (Akı Kahve): ürünler, alışveriş listesi (Todos), görseller, seed, ilgili ekranlar. Kapalıyken boş iskelet; backend yokken kapatılamaz |
| `--backend` / `--no-backend` | API (varsayılan evet). Hayır: veri cihazda (SQLite + Drizzle); yalnız mobil, auth kapalı                                                            |
| `--lang` / `--no-lang`       | Çoklu dil: dil seçici, adres öneki, çeviri yönetimi                                                                                                 |
| `--no-install`               | `pnpm install`, `generate`, `format` adımlarını atla (varsayılan: yapılır)                                                                          |
| `--no-git`                   | `git init` + ilk commit yapma                                                                                                                       |

Mekanik ve kararlar: kök `DECISIONS.md` → "create-ako-app: üretim mekaniği".

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

### Bir kerelik kurulum

- **İlk sürüm elle:** npm'de trusted publisher paket sayfasından tanımlandığı için paket önce var olmalı. `npm login`, sonra main'den `cd packages/create-ako-app && npm publish`.
- **Trusted publisher:** npmjs.com → `create-ako-app` → Settings → Trusted Publisher → GitHub Actions: kullanıcı `aykutyilmaz37`, depo `ako-starter`, iş akışı `release.yml` (environment boş).
- **Token'ları kapat:** aynı sayfada Publishing access → "Require two-factor authentication and disallow tokens".
- **İş akışını aç:** GitHub → Settings → Secrets and variables → Actions → Variables → `RELEASE_ENABLED` = `true`. Ayrıca Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" açık olmalı (sürüm PR'ı için).
