# create-ako-app

## 0.3.0

### Minor Changes

- 7212891: Web şablonuna SEO tabanı eklendi: canonical, `sitemap.xml`, `robots.txt`, ürün detayında JSON-LD ve CDN önbelleği (`publicCacheControl`). Backoffice indekslenmez (`robots.txt` + `X-Robots-Tag: noindex`).

  Üretilen projenin köküne `.ako.json` (sürüm + seçimler) yazılıyor; şablon güncellemelerini mevcut projelere taşımak için kullanılır.

  **Mevcut projede (0.2.x → 0.3.0):** `packages/web-core/src/seo.ts` dosyasını kopyalayıp `index.ts`'ten dışa açın; site'a `features/seo/pages/{sitemap,robots}.ts` ve `routes.ts`'e iki route ekleyin; `root.tsx`'e `<link rel="canonical">`; backoffice `server.ts`'e `app.use('*', noIndex)` ve `robots.txt` route'u. Elle eklenen `.ako.json` için `version` alanına `0.2.2` yazın.

## 0.2.2

### Patch Changes

- ab107fb: mari-ui 0.6.1: üretilen projeler `@mari-ui/*` paketlerinin 0.6.1 sürümüyle kurulur.

## 0.2.1

### Patch Changes

- 6d78aef: npm sayfasındaki README kullanıcıya göre yeniden yazıldı: ne ürettiği, sorular (koşullarıyla), sorusuz kullanım, seçenekler, gereksinimler. Bakımcıya yönelik geliştirme ve yayın notları pakete girmeyen `RELEASING.md`'ye taşındı.

## 0.2.0

### Minor Changes

- 6068d59: Üretilen projeler deploy'a hazır: web uygulamaları için Dockerfile, tek sunucu + Docker için `compose.prod.yaml` ve `.env.prod.example` (postgres → migrate → API → site/backoffice, sağlık kontrolleri), API'de `dotnet Ako.Api.dll migrate` deploy adımı (migration + ilk Admin hesabı) ve README'de deploy bölümü. Sosyal girişten dönüşte dil korunur. Web uygulamalarında `GET /health`.

### Patch Changes

- 6068d59: mari-ui 0.6.0: üretilen projelerde mari-ui CLI'ın yazdığı kural dosyaları (AGENTS.md, CLAUDE.md…) Prettier biçiminde; `.prettierignore` istisnaları kalktı. Bileşenlerde değişiklik yok.

## 0.1.2

### Patch Changes

- 3cc3b3b: 0.1.1 pakette `bin/create-ako-app.mjs` ve şablonun `pnpm-lock.yaml`'ı olmadan yayınlandı (`npx create-ako-app` → "command not found"). Komut dosyası kök `.gitignore`'daki `bin/` kuralı yüzünden git'e hiç girmemişti (yerelde paketlenen 0.1.0'da vardı); artık depoda. Yayın `npm pack` ile paketlenir (pnpm lockfile'ı düşürüyordu) ve yüklemeden önce zorunlu dosyalar denetlenir.

## 0.1.1

### Patch Changes

- 6371d1f: Web: geçersiz oturumda giriş sayfası açık kalır. Site giriş sayfası kullanıcıyı ana sayfaya yalnızca `/me` başarılıysa yönlendirir (kullanıcı API'de silinmişse giriş yapılamıyordu). Sayfa isteğinde token yenilenirken API'ye ulaşılamazsa sayfa 500 vermez, oturum korunur.
