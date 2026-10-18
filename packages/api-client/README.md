# @ako/api-client

`apps/api/openapi.json`'dan **Orval** ile üretilen tipli API istemcisi: fetch fonksiyonları, TanStack Query hook'ları,
tipler ve zod şemaları. Elle contract yazılmaz.

```text
src/
  client.ts       tüm isteklerin geçtiği fetch katmanı (adres, dil, token, 401'de yenileme, hata)
  errors.ts       ApiError + applyFieldErrors
  generated/      Orval çıktısı — elle düzenlenmez, commit edilir
    endpoints/<etiket>/   fonksiyonlar + hook'lar (API'deki her etiket ayrı klasör: auth, products, todos)
    model/                istek/yanıt tipleri
    zod/<etiket>/         form doğrulaması için zod şemaları
```

## Kullanım

```ts
import { configureApiClient, applyFieldErrors } from '@ako/api-client';
import { useListProducts, useCreateProduct } from '@ako/api-client/products';
import { CreateProductBody } from '@ako/api-client/zod/products';
import type { ProductResponse } from '@ako/api-client/model';

// Uygulama açılırken bir kez:
configureApiClient({
  baseUrl: '/api', // web: Hono BFF | mobil: API adresi
  getLanguage: () => i18n.language, // hata mesajları bu dilde gelir
  tokens: secureStoreTokens, // yalnızca mobil (TokenStore: get/set)
  onSessionExpired: () => router.replace('/login'),
});

// Bileşende:
const { data } = useListProducts({ page: 1, pageSize: 20, search });
const create = useCreateProduct({
  mutation: { onError: (error) => applyFieldErrors(error, form.setError) || toast(error.message) },
});
create.mutate({ data: values });
```

- **Giriş:** `useLogin`, `useExchangeLoginCode`, `useNativeLogin` token döner; mobilde `setAuthTokens(cevap)` ile saklanır.
  Sonraki istekler token'ı otomatik ekler; 401'de `/auth/refresh` ile yenileyip isteği bir kez tekrarlar
  (aynı anda gelen 401'ler tek yenileme bekler). Yenileme de başarısızsa token silinir, `onSessionExpired` çağrılır.
- **Hatalar:** her hata `ApiError`: `status`, `code` (ör. `products.sku_taken`), `fieldErrors` (alan → mesajlar),
  `message` (API'nin çevirdiği metin). `applyFieldErrors(error, form.setError)` 400'deki alan hatalarını forma bağlar.
- **Formlar:** `CreateProductBody` gibi zod şemaları `zodResolver` ile kullanılır. Bunlar tip ve zorunluluk bilgisini
  taşır; asıl kurallar (FluentValidation) API'dedir ve hataları `applyFieldErrors` ile forma gelir.

## Üretim

```bash
pnpm generate           # kökten: API'yi derler (openapi.json) ve istemciyi yeniden üretir
pnpm generate:check     # üretilen kod commit'tekiyle aynı mı? CI'da kullanılır, farklıysa hata verir
```

Turbo sırası: `@ako/api#build` → `@ako/api-client#generate` → `typecheck`. API'de bir endpoint değişince
`pnpm generate` çalıştırıp çıktıyı da commit edin.
