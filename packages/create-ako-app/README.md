# create-ako-app

ako-starter şablonundan yeni proje üretir.

```bash
node packages/create-ako-app/bin/create-ako-app.mjs ../yeni-proje            # sorularla
node packages/create-ako-app/bin/create-ako-app.mjs ../yeni-proje -y --web=site --no-mobile --no-auth --install
node packages/create-ako-app/bin/create-ako-app.mjs ../mobil-proje -y --web=none --no-backend --install   # backend yok
```

| Seçenek                      | Anlamı                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `--web=site,backoffice,none` | Web uygulamaları                                                                         |
| `--mobile` / `--no-mobile`   | Expo mobil                                                                               |
| `--auth` / `--no-auth`       | Giriş, kayıt, misafir, Todos, yönetim (kapalıyken backoffice yok)                        |
| `--backend` / `--no-backend` | API (varsayılan evet). Hayır: veri cihazda (SQLite + Drizzle); yalnız mobil, auth kapalı |
| `--lang` / `--no-lang`       | Çoklu dil: dil seçici, adres öneki, çeviri yönetimi                                      |
| `--install`                  | `pnpm install`, `generate`, `format`                                                     |
| `--no-git`                   | `git init` + ilk commit yapma                                                            |

Mekanik ve kararlar: kök `DECISIONS.md` → "create-ako-app: üretim mekaniği".

## Geliştirme

```bash
pnpm --filter create-ako-app test                       # birim testler
pnpm --filter create-ako-app variants                   # model/şema değişince migration setlerini yenile (EF + Drizzle)
pnpm --filter create-ako-app verify -- --only=no-auth-site   # üret + CI komutları (yavaş; Docker gerekir)
pnpm --filter create-ako-app verify -- --only=no-backend     # dotnet gerekmez; Expo export dahil
```

Şablona özellik işareti eklerken: `src/markers.mjs` başındaki sözdizimi, silinecek yollar `src/plan.mjs`'te.
