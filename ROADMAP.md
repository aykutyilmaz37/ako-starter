# ako-starter — Yol haritası

Kararlar `DECISIONS.md`'de; burada **sıra** ve **bitti tanımı** var. Her aşama kendi başına commit'lenebilir, bir sonrakine başlamadan kapanır. Son durum: 2026-10-19, çalışma ağacı temiz (`4ffb35b`).

## Durum

| Alan                                                                  | Durum           |
| --------------------------------------------------------------------- | --------------- |
| API (Auth, Products, Todos, Localization, Identity, ArchTests, xUnit) | Var             |
| Web: site + backoffice (RR8 + Hono BFF + mari-ui), çoklu dil          | Var             |
| api-client (Orval), web-core, shared                                  | Var             |
| Akı Kahve senaryosu ve tasarım                                        | Var             |
| Web testleri (Vitest/Playwright)                                      | Yok             |
| CI (build, `generate:check`, audit)                                   | Yok             |
| Mobil (`apps/mobile`)                                                 | Yalnızca README |
| create-ako-app                                                        | Yok             |
| Deploy hedefi                                                         | Karar bekliyor  |

## Aşama 0 — Backoffice sidebar responsive

- [x] Geniş ekranda `variant="hover"` şeridi, dar ekranda üst çubuktaki düğmeyle açılan `variant="drawer"` çekmecesi (`admin-layout.tsx`).
- [ ] Tarayıcıda dar ekranda elle doğrula (tarayıcı paneli backoffice'e gitmiyor; Chrome ile `admin.localhost:5174`).

## Aşama 1 — Güvence (önce bu)

Şablon sağlam olmadan üstüne bir şey eklemeyelim; sonraki aşamalardaki her değişiklik bu ağla kontrol edilir.

- [x] GitHub Actions (`.github/workflows/ci.yml`; CI yeşil): `pnpm build`, `typecheck`, `lint`, `test`, `generate:check`, `dotnet test`, `pnpm audit`, `dotnet list package --vulnerable`.
- [x] Vitest: `web-core` (BFF, oturum, token yenileme: 6 test) ve `api-client` (`apiFetch`, `ApiError`, `applyFieldErrors`: 8 test).
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

- [ ] API: `POST /auth/guest` (rol `Guest`, normal token), IP başına rate limit.
- [ ] API: `AppPolicies.Member`; örnek özelliklerde policy seçimi: biri misafire açık (ör. Todos), biri yalnız üyeye. Yeni kişisel uçların varsayılanı `Member`.
- [ ] API: misafirden üyeliğe geçiş: kayıt, e-posta kodu, sosyal ve native giriş misafir token'ıyla gelince aynı kullanıcı yükseltilir.
- [ ] API: var olan hesaba girişte `IGuestDataMerger` (Common) ile her özelliğin misafir verisini taşıması, sonra misafirin silinmesi; ArchTests sınırları korunur.
- [ ] API: eski misafir temizliği (arka plan işi, `Auth:Guest:RetentionDays`).
- [ ] API testleri: misafir oluşturma, policy (misafir 403 / üye 200), yükseltme, birleştirme, temizlik.
- [ ] Mobil: açılışta token yoksa misafir; oturum durumları `guest` / `member`; misafire kapalı ekranlarda giriş daveti; kayıt/giriş sonrası verinin korunduğunu gösteren akış; geçersiz misafir token'ında sessizce yenisi.
- [ ] Web: misafir gerekiyor mu (BFF misafir oturumu) kararı; şimdilik web anonim + üye.

**Bitti:** simülatörde giriş yapılıp ürün listelenir, listeye ürün eklenir; misafir olarak listeye eklenen veri kayıt olunca kaybolmaz. (Telefonda/Expo Go ile elle denenecek: giriş, listeye ekleme, dil değişimi.)

## Aşama 3 — create-ako-app

Şablonun asıl ürünü bu; önce çıkarılacak parçalar temiz olmalı (Aşama 1–2).

- [ ] Sorular: web / mobil / ikisi; backend (API / yok, yalnız mobilde); auth (+ sağlayıcılar, misafir girişi); çoklu dil; reklam + rıza; analitik; uzaktan ayar; örnek senaryo (Akı Kahve) kalsın mı.
- [ ] Silme kuralları: seçilmeyen uygulama klasörü, `Features/Auth` (`// ako:auth` işaretleri), `features/localization` + `:lang?` + `/localization`, Todos/Products örnekleri.
- [ ] Backend'siz mobil varyantı (karar: DECISIONS.md): `expo-sqlite` + Drizzle iskeleti, paketli migration'lar, örnek özellik yerel veriyle (`features/<özellik>/data/`); `api-client`, oturum, sosyal giriş ve API sözlüğü bağımlılıklarının temiz çıkarılması.
- [ ] Reklam + rıza modülü: AdMob, iOS ATT, Google UMP; geliştirme derlemesi (EAS) yapılandırması.
- [ ] Analitik ve uzaktan ayar modülü: Firebase (GA4, Remote Config) ya da CDN JSON ile zorunlu güncelleme kontrolü.
- [ ] Her kombinasyon için otomatik sınama: üret → `build` + `typecheck` + `dotnet test` geçer mi.
- [ ] `npm create ako-app` yayın akışı.

**Bitti:** en az 5 kombinasyon (yalnız web, yalnız mobil, ikisi, auth/dil kapalı, yalnız mobil + backend yok) üretilip derleniyor.

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
