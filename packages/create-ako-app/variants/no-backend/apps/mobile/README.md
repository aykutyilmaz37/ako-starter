# apps/mobile

Expo (SDK 57; Expo Go uyumu için) + expo-router + `@mari-ui/native`. **Backend yok**: veri cihazdadır, uygulama internete yalnızca (eklerseniz) reklam, analitik ya da uzaktan ayar gibi üçüncü taraf servisler için çıkar.

```bash
pnpm --filter @ako/mobile dev          # Expo geliştirme sunucusu (i: iOS simülatörü)
pnpm --filter @ako/mobile typecheck
pnpm --filter @ako/mobile db:generate  # şema değişince SQL migration'ı üretir (drizzle/)
pnpm --filter @ako/mobile theme        # mari-ui.config.json -> mari-ui-theme.ts
```

## Veri

- **Katalog (salt okunur)**: `features/catalog/data/products.json` uygulamayla paketlidir; görseller `assets/products`, eşleme `images.ts`. Veritabanında tutulmaz.
- **Alışveriş listesi (kullanıcı verisi)**: `expo-sqlite` + Drizzle ORM. Tipli şema `features/shopping-list/data/schema.ts`, sorgular `queries.ts`, ekranların kullandığı hook'lar `hooks.ts`. Ekranlar yalnızca hook kullanır; `useLiveQuery` tablo değişince ekranı kendiliğinden günceller.
- **Migration'lar**: şemayı değiştirince `pnpm --filter @ako/mobile db:generate` çalıştırın; `drizzle/` altındaki SQL ve `migrations.js` uygulamaya paketlenir, açılışta `lib/database.tsx` (`DatabaseProvider`) uygular. `drizzle/` üretilmiş dosyadır, elle düzenlemeyin.
- **Yeni özellik**: `features/<özellik>/data/` altına `schema.ts` (tablo), `queries.ts`, `hooks.ts` ekleyin; `drizzle.config.ts` tüm `features/*/data/schema.ts` dosyalarını okur.
- **Küçük ayarlar** (tema, dil): `lib/prefs.ts`, `expo-sqlite/kv-store`.
- Veritabanı tek dosyadır (`app.db`) ve işletim sisteminin otomatik yedeğine girer.

## Metinler ve tema

- Metinler `locales/*.json`; `useT()` ile okunur, anahtarlar `tr.json`'dan türer. Sözlük yalnızca paketli dosyalardan gelir.
- Tema ve dil Hesap sekmesinden seçilir, cihazda saklanır.
- Tema web sitesiyle aynı renkleri kullanır (`mari-ui.config.json`); `mari-ui-theme.ts` üretilmiş dosyadır.
- `react` sürümü Expo SDK'sının istediğine sabittir (`expo install --check` temiz olmalı).
