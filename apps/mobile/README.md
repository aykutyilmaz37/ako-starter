# apps/mobile

Expo (SDK 57; Expo Go uyumu için) + expo-router + `@mari-ui/native`. API'ye doğrudan bağlanır; token'lar SecureStore'da (`features/auth/token-store.ts`), 401'de `api-client` tek uçuşla yeniler.

```bash
pnpm --filter @ako/mobile dev      # Expo geliştirme sunucusu (i: iOS simülatörü)
pnpm --filter @ako/mobile typecheck
pnpm --filter @ako/mobile theme    # mari-ui.config.json -> mari-ui-theme.ts
```

- API adresi: `EXPO_PUBLIC_API_URL` (varsayılan iOS `http://localhost:5165`, Android `http://10.0.2.2:5165`).
- Tema web sitesiyle aynı renkleri kullanır (`mari-ui.config.json`); `mari-ui-theme.ts` üretilmiş dosyadır.
- `react` sürümü Expo SDK'sının istediğine sabittir (`expo install --check` temiz olmalı).

## Yapı

Özellik başına klasör (web uygulamalarındaki `features/` ile aynı mantık); ekranlar (`app/`, yalnızca yönlendirme ve sayfa düzeni) özelliklerin hook ve bileşenlerini kullanır.

- `features/auth/`: `session.tsx` (oturum, misafir), `token-store.ts`, `social-login.ts`, `components/` (giriş ekranı kabuğu, sosyal düğme, çevrimdışı ekranı).
- `features/catalog/`: `data/` (`hooks.ts` ürün hook'ları, `images.ts`, `schema.ts` tipler), `components/product-card.tsx`, `lib/product.ts` (fiyat, stok, özet biçimleyicileri).
- `features/shopping-list/data/hooks.ts`: alışveriş listesi (API'deki Todos).
- `features/localization/i18n.tsx`, `features/theme/theme-preference.tsx`: dil ve tema tercihi.
- `shared/components/`: özelliğe bağlı olmayan ortak bileşenler. `shared/lib/`: altyapı (`api.ts`, `config.ts`, `prefs.ts`, `brand.ts` tasarım sabitleri).
- Yeni özellik: `features/<özellik>/{data,components,lib}`; özellikler birbirinin iç dosyalarına değil `data/hooks.ts` gibi açık girişlerine bağlanır.
- create-ako-app bu yollara bağlıdır (`src/plan.mjs`: `features/auth`, `features/shopping-list` auth kapalıyken silinir; `variants/no-backend/` aynı yollara yerel veri dosyalarını koyar).

## Giriş yöntemleri

- E-posta + şifre, 6 haneli e-posta kodu (`app/(auth)`).
- Sosyal giriş: API'de ayarı dolu sağlayıcılar (`GET /auth/providers`) için tarayıcı akışı; `returnUrl` Expo Go'da `exp://…/--/auth/callback`, derlenmiş uygulamada `ako://auth/callback`. API'de `Auth:AllowedReturnUrls` içinde `ako://` (ve geliştirmede `exp://`) olmalı.
- Native Apple/Google: API `native` listesinde ise cihazdaki hesap seçici kullanılır, olmazsa/başarısız olursa tarayıcı akışına düşülür. Apple iOS'ta Expo Go'da çalışır; Google için `@react-native-google-signin/google-signin` **geliştirme derlemesi** ister (Expo Go'da yok): config plugin'ini `app.json`'a ekleyip `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` verin.

## Metinler ve tema

- Metinler `locales/{tr,en,de}.json`; `useT()` ile okunur, anahtarlar `tr.json`'dan türer. API'deki `mobile` alanı dosyaların üstüne yazar.
- Tema ve dil Hesap sekmesinden seçilir.
