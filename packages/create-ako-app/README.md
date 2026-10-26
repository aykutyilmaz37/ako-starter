# create-ako-app

Web, mobil ya da ikisini birden içeren yeni bir proje üretir. Kaynak: [ako-starter](https://github.com/tfcs-istanbul/ako-starter) şablonu.

```bash
npx create-ako-app@latest yeni-proje
```

Seçtiğiniz parçalar kalır, gerisi çıkarılır; ardından bağımlılıklar kurulur ve ilk git commit'i atılır. Klasör yoksa oluşturulur, varsa boş olmalıdır. Klasör adını vermezseniz sorulur.

## Ne üretir

- **API** (`apps/api`): .NET 10, PostgreSQL + EF Core. Giriş / kayıt (e-posta kodu ile doğrulama, şifre sıfırlama), misafir girişi, sosyal giriş, roller, çoklu dil, rate limiting, sağlık kontrolleri, testler.
- **Web** (`apps/web/site`, `apps/web/backoffice`): React Router 8 (SSR) + Hono. Tarayıcı API'ye doğrudan gitmez; oturum şifreli çerezde, istekler sunucudan iletilir (BFF). Backoffice yalnızca Admin rolüne açık yönetim panelidir.
- **Mobil** (`apps/mobile`): Expo + expo-router. API'ye bağlı ya da backend'siz (veri cihazda, SQLite).
- **Ortak**: OpenAPI'den üretilen tipli API istemcisi, [mari-ui](https://github.com/tfcs-istanbul/mari-ui) tasarım sistemi (web ve mobil aynı tema), GitHub Actions CI, tek sunucu + Docker için deploy dosyaları.
- **Örnek senaryo** (isteğe bağlı): Akı Kahve. Ürün kataloğu, alışveriş listesi, ürün yönetimi; kapatılırsa boş iskelet kalır.

## Sorular

Her sorunun varsayılanı "evet"tir (Enter). Önceki cevaba göre gereksiz olanlar sorulmaz:

1. Web: site olsun mu? Backoffice olsun mu?
2. Mobil (Expo) olsun mu?
3. Backend (API) olsun mu? _Yalnızca web seçilmeyip mobil seçildiyse sorulur. "Hayır": veri cihazda tutulur (SQLite)._
4. Giriş / kayıt (auth) olsun mu? _Backoffice seçildiyse sorulmaz: yönetim paneli giriş ister._
5. Misafir girişi olsun mu? Sosyal giriş (Google, Apple, GitHub…) olsun mu? _Auth açıksa sorulur._
6. Örnek senaryo (Akı Kahve) kalsın mı? _Backend varsa sorulur; backend'siz mobilde örnek, yerel veri katmanının kendisidir._
7. Çoklu dil olsun mu?
8. `pnpm install` çalıştırılsın mı?

## Sorusuz kullanım

`-y` ile hiçbir şey sorulmaz; seçenekle belirtilmeyen her şey varsayılandır (hepsi açık). Terminal etkileşimli değilse (ör. CI) de sorulmaz.

```bash
npx create-ako-app@latest yeni-proje -y                                  # her şey
npx create-ako-app@latest yeni-proje -y --web=site --no-mobile --no-auth # yalnızca site, girişsiz
npx create-ako-app@latest mobil-proje -y --web=none --no-backend        # yalnızca mobil, veri cihazda
```

`npm create ako-app@latest yeni-proje -- -y …` (seçenekler `--`'dan sonra) ve `pnpm create ako-app yeni-proje -y …` de aynı işi yapar.

| Seçenek                                | Anlamı                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--web=site,backoffice` / `--web=none` | Web uygulamaları (varsayılan: ikisi)                                                                     |
| `--mobile` / `--no-mobile`             | Expo mobil uygulama                                                                                      |
| `--backend` / `--no-backend`           | API. Kapalıyken veri cihazda (SQLite + Drizzle); yalnızca mobil, web ve auth olmaz                       |
| `--auth` / `--no-auth`                 | Giriş, kayıt, misafir, alışveriş listesi, yönetim. Kapalıyken backoffice olmaz                           |
| `--guest` / `--no-guest`               | Misafir girişi: mobilde açılışta anonim hesap; kayıt olunca misafirken eklenen veri hesaba taşınır       |
| `--social` / `--no-social`             | Sosyal giriş (Google, Apple, Facebook, GitHub, X, LinkedIn); sağlayıcılar ayarla açılır                  |
| `--sample` / `--no-sample`             | Örnek senaryo (Akı Kahve): ürünler, alışveriş listesi, görseller, örnek veri. Backend yokken kapatılamaz |
| `--lang` / `--no-lang`                 | Çoklu dil: dil seçici, adreste dil öneki (`/en/…`), çeviri yönetimi                                      |
| `--install` / `--no-install`           | Bağımlılıkları kur, gerekirse API istemcisini yeniden üret, biçimlendir (varsayılan: evet)               |
| `--no-git`                             | `git init` ve ilk commit'i yapma                                                                         |
| `-y`, `--yes`                          | Soru sorma                                                                                               |
| `-h`, `--help`                         | Yardım                                                                                                   |

## Gereksinimler

- Node 24.19+, pnpm (`corepack enable`), git.
- API'li projelerde: .NET 10 SDK; yerel veritabanı ve deploy için Docker.

## Sonra

```bash
cd yeni-proje
```

Projenin `README.md`'si seçtiğiniz kombinasyona göre çalıştırma komutlarını (veritabanı, API, web, mobil), doğrulama adımlarını ve deploy'u (tek sunucu + Docker: `compose.prod.yaml`) anlatır. Mimari kararlar `DECISIONS.md`'de.
