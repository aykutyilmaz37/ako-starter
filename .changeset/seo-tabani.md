---
'create-ako-app': minor
---

Web şablonuna SEO tabanı eklendi: canonical, `sitemap.xml`, `robots.txt`, ürün detayında JSON-LD ve CDN önbelleği (`publicCacheControl`). Backoffice indekslenmez (`robots.txt` + `X-Robots-Tag: noindex`).

Üretilen projenin köküne `.ako.json` (sürüm + seçimler) yazılıyor; şablon güncellemelerini mevcut projelere taşımak için kullanılır.

**Mevcut projede (0.2.x → 0.3.0):** `packages/web-core/src/seo.ts` dosyasını kopyalayıp `index.ts`'ten dışa açın; site'a `features/seo/pages/{sitemap,robots}.ts` ve `routes.ts`'e iki route ekleyin; `root.tsx`'e `<link rel="canonical">`; backoffice `server.ts`'e `app.use('*', noIndex)` ve `robots.txt` route'u. Elle eklenen `.ako.json` için `version` alanına `0.2.2` yazın.
