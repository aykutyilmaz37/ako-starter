# ako-starter — Yol haritası

Kararlar `DECISIONS.md`'de; burada **sıra** ve **bitti tanımı** var. Her aşama kendi başına commit'lenebilir, bir sonrakine başlamadan kapanır. Son durum: 2026-10-21.

## Durum

| Alan                                                                  | Durum                        |
| --------------------------------------------------------------------- | ---------------------------- |
| API (Auth, Products, Todos, Localization, Identity, ArchTests, xUnit) | Var                          |
| Web: site + backoffice (RR8 + Hono BFF + mari-ui), çoklu dil          | Var                          |
| api-client (Orval), web-core, shared                                  | Var                          |
| Akı Kahve senaryosu ve tasarım                                        | Var                          |
| Web testleri (Vitest/Playwright)                                      | Var                          |
| CI (build, `generate:check`, audit)                                   | Var                          |
| Mobil (`apps/mobile`)                                                 | Var                          |
| create-ako-app                                                        | Var (yayın talimat bekliyor) |
| Deploy hedefi                                                         | Gerçek projede seçilir       |

## Aşama 1 — Güvence (önce bu)

Şablon sağlam olmadan üstüne bir şey eklemeyelim; sonraki aşamalardaki her değişiklik bu ağla kontrol edilir.

- [x] GitHub Actions (`.github/workflows/ci.yml`; CI yeşil): `pnpm build`, `typecheck`, `lint`, `test`, `generate:check`, `dotnet test`, `pnpm audit`, `dotnet list package --vulnerable`.
- [x] Vitest: `web-core` (BFF, oturum, token yenileme; sayfa isteğinde (SSR) yenileme dahil: 9 test) ve `api-client` (`apiFetch`, `ApiError`, `applyFieldErrors`: 8 test).
- [x] Playwright (`packages/e2e`, `pnpm --filter @ako/e2e test:e2e`): site ürün listesi + dil değiştirme, backoffice admin girişi + ürün ekleme. CI işi `e2e` yeşil.
- [x] Dependabot: yalnızca güvenlik güncellemeleri, gruplu PR (`.github/dependabot.yml`). Rutin sürüm güncellemesi kapalı.
- [x] Temiz klonda doğrulama: `pnpm i --frozen-lockfile` sonrası `generate:check`, `typecheck`, `lint`, `build`, `test` geçti (2026-10-19); kök `README.md` eklendi.

**Bitti:** boş bir klondan CI yeşil; README'deki komutlar birebir çalışıyor.

## Aşama 2 — Mobil

- [x] `apps/mobile` Expo iskeleti + `@mari-ui/native`, `api-client` yapılandırması (`TokenStore` SecureStore, 401'de refresh).
- [x] Giriş/kayıt, e-posta kodu doğrulama (`(auth)` ekranları, `Stack.Protected`; katalog girişsiz açık, giriş yalnızca kişisel ekranlar için).
- [x] Sosyal giriş (`expo-web-browser` + `ako://`/`exp://`, `/auth/exchange`); **sağlayıcı ayarı olmadığından denenmedi**.
- [x] Akı Kahve ekranları: ana sayfa, mağaza, ürün detayı, alışveriş listem (sekme + "listeye ekle"), hesap; açık/koyu/sistem tema.
- [x] Çoklu dil: `GET /localization/{dil}/mobile` alanı eklendi (karar: DECISIONS.md), dil seçici Hesap sekmesinde.
- [x] Native Google/Apple girişi (`/auth/native/{provider}`; SDK yoksa tarayıcı akışına düşer); **denenmedi**: Google için geliştirme derlemesi + istemci kimliği gerekir.

### Misafir girişi (karar: DECISIONS.md, "Misafir ve kimlik")

- [x] API: `POST /auth/guest` (rol `Guest`, normal token; `/auth` grubunun IP başına rate limit'i).
- [x] API: `AppPolicies.Member`; `Todos` misafire açık, e-posta değiştirme yalnız üye. Yeni kişisel uçların varsayılanı `Member`.
- [x] API: misafirden üyeliğe geçiş ("claim" modeli): `POST /auth/guest/claim`; kayıt, e-posta/şifre, sosyal ve native giriş sonrası aynı uç (DECISIONS.md).
- [x] API: `IGuestDataMerger` (Common) ile her özelliğin misafir verisini taşıması, sonra misafirin silinmesi (`Todos` örneği uygular); ArchTests sınırları korunur.
- [x] API: eski misafir temizliği (`GuestCleanupService`, `Auth:Guest:RetentionDays`, `LastActiveAt` + migration `GuestUsers`).
- [x] API testleri (`GuestTests`, 10 test): oluşturma, yenileme, policy, claim, idempotans, geçersiz/üye token, temizlik.
- [x] Mobil: açılışta otomatik misafir; oturum durumları `guest` / `member`; alışveriş listesi misafirde çalışır (kayıt daveti kartı); giriş sonrası `claim`, token saklama; geçersiz oturumda sessizce yeni misafir. **Telefonda (Expo Go) denendi.**
- [x] Web: karar: gerekmez, anonim + üye kalır (SEO/CDN için herkese açık sayfalar anonim); ihtiyaç doğarsa BFF aynı uçla misafir oturumu açabilir.

**Bitti:** telefonda (Expo Go) giriş yapılıp ürün listelenir, listeye ürün eklenir; misafir olarak listeye eklenen veri kayıt olunca kaybolmaz. Sosyal ve native giriş gerçek sağlayıcı ayarı olmadan denenemedi (kod hazır).

## Aşama 3 — create-ako-app

Şablonun asıl ürünü bu; önce çıkarılacak parçalar temiz olmalı (Aşama 1–2).

- [x] (kısmen) `packages/create-ako-app` iskeleti: web (site/backoffice) / mobil / ikisi seçimi, seçilmeyeni silme, CI/launch/README düzeltmesi, `verify` betiği (5 kombinasyon: install + typecheck + build + dotnet build geçti). `--no-auth` varyantı (API/site/mobil, auth'suz migration seti, `ako:` işaretleri) `--no-lang` varyantı (API/site/backoffice/mobil, dört migration seti) ve 10 kombinasyon doğrulaması tamam. Kalan sorular:
- [x] Sorular: web / mobil / ikisi; backend (API / yok); auth; **misafir girişi** (`--guest`/`--no-guest`, migration varyantları `no-guest`, `no-guest-no-lang`); çoklu dil.
- [x] Sosyal giriş aç/kapa (`--social`/`--no-social`; sağlayıcı bazında seçim yok, sağlayıcılar ayarla açılır: DECISIONS.md). `verify`: `no-social-both`, `no-social-no-guest-no-lang`.
- [x] Örnek senaryo kalsın mı (`--sample`/`--no-sample`; boş iskelet, backend yokken kapatılamaz; altı yeni `*-no-sample` migration seti, DECISIONS.md). `verify`: `no-sample-both`, `no-sample-site`, `no-sample-no-auth`, `no-sample-no-guest-no-lang`.
- [x] (kısmen) Silme kuralları: seçilmeyen uygulama klasörü, `Features/Auth` (`ako:auth`), localization (`ako:lang`), misafir (`ako:guest`). Sosyal giriş (`ako:social`) ve örnek senaryo (`ako:sample`, `ako:todos`) tamam.
- [x] Backend'siz mobil varyantı (`--no-backend`, karar: DECISIONS.md): `expo-sqlite` + Drizzle, paketli migration'lar, Akı Kahve yerel veriyle (katalog paketli JSON, alışveriş listesi SQLite); `api-client`, oturum, sosyal giriş, API sözlüğü, compose/CI/turbo bağları temiz çıkar. `verify`: `no-backend`, `no-backend-no-lang` (Expo export dahil). **Cihazda/simülatörde elle denenmedi** (typecheck + Hermes paketleme ile doğrulandı).
- [x] Mobil uygulama feature-tabanlı yapıya taşındı (`features/{auth,catalog,shopping-list,localization,theme}`, `shared/{components,lib}`; DECISIONS.md). Backend'siz varyantta ekranlardaki `ako:backend` işaretleri kalktı, varyant dosyaları hook'ları değiştirir. **Cihazda/simülatörde elle denenmedi** (typecheck + `verify`).
- [x] mari-ui 0.4.0'a geçiş (Table `footer` + `Pagination`, Empty `actions`, mobilde alt yol importları + eslint `no-restricted-imports`); backend'siz varyant da güncellendi, `verify` geçti.
- [x] ~~Her kombinasyonu CI'da otomatik üretip derleme~~: iptal, çok uzun sürüyor; yerelde `verify` yeterli.
- [ ] `npm create ako-app` yayın akışı. **Talimat bekliyor.**
- [ ] mari-ui CLI düzeltmesi gelince: mobilde `mari-ui sync` çalıştır, `ai-rules` script'ini geri ekle (0.4.0 native projeye web kuralları yazıyor).

**Bitti:** en az 5 kombinasyon (yalnız web, yalnız mobil, ikisi, auth/dil kapalı, yalnız mobil + backend yok) üretilip derleniyor.

## Aşama 4 — Üretilen projenin deploy'a hazırlığı

ako-starter kendisi deploy edilmez, npm paketi olarak yayınlanır; gerçek deploy üretilen projede yapılır. Bu aşama üretilen projenin deploy'a hazır çıkmasını sağlar (VPS gerekmez). Yayından önce bitirilir.

- [ ] Web uygulamaları (site, backoffice) için Dockerfile'lar (API'ninki var).
- [ ] Örnek production compose (VPS + Docker başlangıç noktası) ve sağlık kontrolleri.
- [ ] Bilinen sınır: sosyal girişten dönüşte dil kaybı (`/bff/external/callback`).
- [ ] Üretilen projenin README'sine deploy notları: migration stratejisi, gizli bilgi yönetimi.

Gerçek projeye bırakılanlar: deploy hedefi (VPS / bulut), CDN başlıklarının gerçek ortamda doğrulanması, gözlemlenebilirlik (OTLP) hedefi.

## Çalışma kuralları (token tasarrufu)

1. Oturuma tek aşamayla, tek hedef cümlesiyle başla: "Aşama 1, CI'ı kur."
2. Önce `DECISIONS.md` ve bu dosya okunur; kod keşfi yalnızca ilgili klasörde yapılır.
3. Her madde bitince bu dosyada işaretlenir ve commit'lenir; yeni karar `DECISIONS.md`'ye girer.
4. Bir oturum bir aşamayı aşmaz; bitince yeni oturum.
