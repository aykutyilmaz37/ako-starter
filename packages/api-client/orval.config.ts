import { defineConfig } from 'orval';

// apps/api/openapi.json → TypeScript. Çıktı (src/generated) elle düzenlenmez, `pnpm generate` ile yeniden üretilir.
const input = { target: '../../apps/api/openapi.json' };

export default defineConfig({
  // fetch fonksiyonları + TanStack Query hook'ları + tipler (her API etiketi ayrı klasör)
  api: {
    input,
    output: {
      mode: 'tags-split',
      target: 'src/generated/endpoints',
      schemas: 'src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        // Tüm istekler client.ts'teki apiFetch'ten geçer (adres, dil, token, hata).
        mutator: { path: 'src/client.ts', name: 'apiFetch' },
        // Fonksiyonlar doğrudan veriyi döner; hata durumunda ApiError fırlatılır.
        fetch: { includeHttpResponseReturnType: false },
        query: { signal: true },
      },
    },
  },
  // Formlar için zod şemaları (react-hook-form + zodResolver)
  zod: {
    input,
    output: {
      mode: 'tags-split',
      target: 'src/generated/zod',
      client: 'zod',
      clean: true,
    },
  },
});
