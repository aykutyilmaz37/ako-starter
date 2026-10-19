# apps/mobile

Expo (SDK 58) + expo-router + `@mari-ui/native`. API'ye doğrudan bağlanır; token'lar SecureStore'da (`lib/token-store.ts`), 401'de `api-client` tek uçuşla yeniler.

```bash
pnpm --filter @ako/mobile dev      # Expo geliştirme sunucusu (i: iOS simülatörü)
pnpm --filter @ako/mobile typecheck
pnpm --filter @ako/mobile theme    # mari-ui.config.json -> mari-ui-theme.ts
```

- API adresi: `EXPO_PUBLIC_API_URL` (varsayılan iOS `http://localhost:5165`, Android `http://10.0.2.2:5165`).
- Tema web sitesiyle aynı renkleri kullanır (`mari-ui.config.json`); `mari-ui-theme.ts` üretilmiş dosyadır.
- `react` sürümü Expo SDK'sının istediğine sabittir (`expo install --check` temiz olmalı).
