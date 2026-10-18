# apps/web

Her web ürünü ayrı bir uygulamadır (ayrı build, ayrı domain, ayrı deploy). Hepsi aynı yapıyı kullanır:
**React Router 8** (framework modu, SSR) + **Hono** sunucusu (BFF) + **mari-ui** + **TanStack Query**.

Örnek senaryo **Akı Kahve** (butik kahve kavurucusu); tasarım kararları kök `DECISIONS.md` → "Tasarım ve örnek senaryo".

| Uygulama      | Port | Kimler girer   | Not                                                                   |
| ------------- | ---- | -------------- | --------------------------------------------------------------------- |
| `site/`       | 5173 | herkes         | herkese açık ürünler (SSR + CDN önbelleği), giriş, kayıt, görevler    |
| `backoffice/` | 5174 | yalnızca Admin | kullanıcılar (rol atama), ürünler (ekle/düzenle/sil); iç ağda çalışır |

Yeni bir ürün (ör. `investment`): `backoffice` ya da `site` klasörünü kopyalayın, `package.json` adını, portu
(`vite.config.ts`, `env.server.ts`) ve `cookieName`'i (`app/server.ts`) değiştirin.

## Çalıştırma

```bash
pnpm db:up                              # kökten: Postgres + Mailpit + Aspire Dashboard
pnpm --filter @ako/api dev              # API: http://localhost:5165
pnpm --filter @ako/web-site dev         # http://localhost:5173
pnpm --filter @ako/web-backoffice dev   # http://localhost:5174  (admin@ako.local / Admin123!)
```

Ayarlar `.env` dosyasından ya da ortam değişkenlerinden gelir (bkz. `.env.example`). Geliştirmede hepsinin
varsayılanı vardır; production'da `SESSION_SECRET` zorunludur (yoksa sunucu açılmaz).

## Yapı

```text
app/
  root.tsx          HTML iskeleti, sağlayıcılar, oturum bilgisini sunucuda okuyan root loader
  routes.ts         adres → sayfa eşlemesi (tüm adresler tek yerde)
  server.ts         Hono sunucusu: BFF route'ları (/api/*, /bff/*) + React Router
  env.server.ts     ortam ayarları (.server: tarayıcı paketine asla girmez)
  shared/           uygulama geneli: layout (başlık/menü), useMe
  features/
    <özellik>/
      pages/        sayfa: loader + meta + bileşenlerin yerleşimi (ince)
      components/   formlar, tablolar
      hooks/        sorgular ve işlemler (TanStack Query + api-client)
```

API'deki `Features/<Özellik>` ile aynı mantık: bir özellik tek klasörde açılır, tek klasörde silinir.
`.react-router/` klasörü route tiplerini içerir; `dev` ve `typecheck` tarafından üretilir, commit edilmez.

## Sayfa dosyası (route module)

| Export    | Nerede çalışır    | Ne yapar                                                                                         |
| --------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| `loader`  | yalnızca sunucu   | sayfa çizilmeden önce veriyi çeker (API'ye token'la doğrudan); sonucu bileşene `loaderData` olur |
| `headers` | sunucu            | HTTP başlıkları, ör. `Cache-Control`                                                             |
| `meta`    | sunucu + tarayıcı | `<title>`, açıklama, sosyal medya önizlemesi                                                     |
| `default` | sunucu + tarayıcı | sayfa bileşeni: önce sunucuda HTML'e çizilir, sonra tarayıcıda canlanır                          |

Dinamik adresler `routes.ts`'te yazılır: `route('products/:id', …)` → `params.id`, `route('docs/*', …)` → `params['*']`.

**Sunucu / tarayıcı ayrımı:** `loader`/`action`/`headers` ve `.server.ts` dosyaları tarayıcı paketine hiç girmez
(secret'lar orada durur). Bileşenler her iki tarafta çalıştığı için `window`, `localStorage` gibi tarayıcı
nesneleri yalnızca `useEffect` ya da olay fonksiyonlarında kullanılır.

**Veriyi nerede çekmeli?** Herkese açık, SEO önemli, önbelleğe alınabilir → `loader` (site/products).
Kullanıcıya özel, etkileşimli → TanStack Query hook'ları (site/todos, backoffice'in tamamı).

## BFF (`packages/web-core`)

Tarayıcı .NET API'ye hiç gitmez ve token görmez:

```text
tarayıcı ──/api/*──▶ Hono BFF ──Bearer token──▶ .NET API
              (şifreli httpOnly çerez)
```

- Token'lar AES-GCM ile şifrelenmiş httpOnly çerezde; sunucuda oturum deposu yok.
- `/api/*` API'ye iletilir; 401'de token sunucuda yenilenir ve çerez güncellenir.
- `useLogin` ve `useExchangeLoginCode` web'de de aynen çalışır: BFF token'ı çereze yazar, tarayıcıya `{}` döner.
- Sosyal giriş: `/bff/external/<sağlayıcı>` (tam sayfa yönlendirme) → API → sağlayıcı → `/bff/external/callback`.
- Çıkış: `logout()` (`@ako/ui`) → `POST /bff/logout`.
- Backoffice: `requiredRole: 'Admin'`; Admin olmayan kullanıcı girişte 403 alır.
- Gerçek istemci IP'si `X-Forwarded-For` ile API'ye iletilir (rate limiting için). API bu başlığa yalnızca
  güvendiği proxy'lerden inanır: varsayılan aynı makine, diğerleri `ForwardedHeaders:KnownNetworks` ile.

## Tema

```text
packages/ui/themes/
  site/mari-ui.config.json        marka rengi, font, kişilik, boşluk → mari-ui-theme.css (üretilir)
  backoffice/mari-ui.config.json
  warm-neutrals.css               sıcak yüzey/kenarlık/metin renkleri (mari-ui config'i bunları değiştiremiyor)
```

Tema değişince: `pnpm --filter @ako/ui theme`. Bileşenlerde ham renk (hex) yazılmaz; `bg-mari-surface`,
`text-mari-muted`, `bg-mari-primary-solid` gibi tema sınıfları kullanılır. Fontlar `@fontsource` ile gömülüdür.

## Formlar

`TextField` / `CodeField` (`@ako/ui`) react-hook-form'u mari-ui `Field`'a bağlar. Şema api-client'ın ürettiği zod
şemasından türetilir (`RegisterBody.extend(...)`), API'nin döndüğü alan hataları `applyFieldErrors` ile aynı alanlara
düşer. Hassas veri içeren formlar `method="post"` kullanır: JavaScript yüklenmezse bile veri URL'ye yazılmaz.
