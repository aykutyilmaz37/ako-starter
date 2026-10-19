# ako-starter — Yol haritası

Kararlar `DECISIONS.md`'de; burada **sıra** ve **bitti tanımı** var. Her aşama kendi başına commit'lenebilir, bir sonrakine başlamadan kapanır. Son durum: 2026-10-19, çalışma ağacı temiz (`4ffb35b`).

## Durum

| Alan | Durum |
| --- | --- |
| API (Auth, Products, Todos, Localization, Identity, ArchTests, xUnit) | Var |
| Web: site + backoffice (RR8 + Hono BFF + mari-ui), çoklu dil | Var |
| api-client (Orval), web-core, shared | Var |
| Akı Kahve senaryosu ve tasarım | Var |
| Web testleri (Vitest/Playwright) | Yok |
| CI (build, `generate:check`, audit) | Yok |
| Mobil (`apps/mobile`) | Yalnızca README |
| create-ako-app | Yok |
| Deploy hedefi | Karar bekliyor |

## Aşama 0 — Backoffice sidebar responsive

- [x] Geniş ekranda `variant="hover"` şeridi, dar ekranda üst çubuktaki düğmeyle açılan `variant="drawer"` çekmecesi (`admin-layout.tsx`).
- [ ] Tarayıcıda dar ekranda elle doğrula (tarayıcı paneli backoffice'e gitmiyor; Chrome ile `admin.localhost:5174`).

## Aşama 1 — Güvence (önce bu)

Şablon sağlam olmadan üstüne bir şey eklemeyelim; sonraki aşamalardaki her değişiklik bu ağla kontrol edilir.

- [x] GitHub Actions (`.github/workflows/ci.yml`; ilk çalıştırma doğrulanmadı): `pnpm build`, `typecheck`, `lint`, `test`, `generate:check`, `dotnet test`, `pnpm audit`, `dotnet list package --vulnerable`.
- [ ] Vitest: `web-core` (oturum, token yenileme) ve `api-client` (`ApiError`, `applyFieldErrors`).
- [ ] Playwright: tek duman testi (site: ürün listesi + dil değiştirme; backoffice: admin girişi + ürün ekleme).
- [x] Dependabot ayarı (`.github/dependabot.yml`).
- [ ] Temiz klonda doğrulama: `pnpm i && pnpm db:up` sonrası README adımlarıyla her şey ayağa kalkıyor mu?

**Bitti:** boş bir klondan CI yeşil; README'deki komutlar birebir çalışıyor.

## Aşama 2 — Mobil

- [ ] `apps/mobile` Expo iskeleti + `@mari-ui/native`, `api-client` yapılandırması (`TokenStore` SecureStore, 401'de refresh).
- [ ] Giriş/kayıt, e-posta kodu, sosyal giriş (`AuthSession` + `ako://`), `/auth/exchange`.
- [ ] Akı Kahve ekranları: ürün listesi/detay, alışveriş listem.
- [ ] Çoklu dil (sözlük `GET /localization/{dil}/mobile` alanı gerekir mi, karar ver).
- [ ] Native Google/Apple girişi (`/auth/native/{provider}`).

**Bitti:** simülatörde giriş yapılıp ürün listelenir, listeye ürün eklenir.

## Aşama 3 — create-ako-app

Şablonun asıl ürünü bu; önce çıkarılacak parçalar temiz olmalı (Aşama 1–2).

- [ ] Sorular: web / mobil / ikisi, auth (+ sağlayıcılar), çoklu dil, örnek senaryo (Akı Kahve) kalsın mı.
- [ ] Silme kuralları: seçilmeyen uygulama klasörü, `Features/Auth` (`// ako:auth` işaretleri), `features/localization` + `:lang?` + `/localization`, Todos/Products örnekleri.
- [ ] Her kombinasyon için otomatik sınama: üret → `build` + `typecheck` + `dotnet test` geçer mi.
- [ ] `npm create ako-app` yayın akışı.

**Bitti:** en az 4 kombinasyon (yalnız web, yalnız mobil, ikisi, auth/dil kapalı) üretilip derleniyor.

## Aşama 4 — Üretim hazırlığı

- [ ] Deploy hedefi kararı (VPS + Docker mı, bulut mu); `DECISIONS.md`'ye işle.
- [ ] Production compose / Dockerfile'lar (web uygulamaları dahil), sağlık kontrolleri.
- [ ] Migration stratejisi, gizli bilgi yönetimi, CDN önbellek başlıkları doğrulaması.
- [ ] Gözlemlenebilirlik hedefi (OTLP alıcısı).
- [ ] Bilinen sınır: sosyal girişten dönüşte dil kaybı (`/bff/external/callback`).

## Aşama 5 — Cila (isteğe bağlı)

- [ ] mari-ui `Image` fade-in titremesi.
- [ ] `.github/copilot-instructions.md` kök dizine taşıma.
- [ ] `@mari-ui/modules` adapter deseni (paket npm'e çıkınca).
- [ ] Bun değerlendirmesi.

## Çalışma kuralları (token tasarrufu)

1. Oturuma tek aşamayla, tek hedef cümlesiyle başla: "Aşama 1, CI'ı kur."
2. Önce `DECISIONS.md` ve bu dosya okunur; kod keşfi yalnızca ilgili klasörde yapılır.
3. Her madde bitince bu dosyada işaretlenir ve commit'lenir; yeni karar `DECISIONS.md`'ye girer.
4. Bir oturum bir aşamayı aşmaz; bitince yeni oturum.
