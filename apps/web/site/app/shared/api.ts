import { configureApiClient } from '@ako/api-client';

/**
 * api-client'ı ortama göre ayarlar; root.tsx'te bir kez çağrılır.
 *   tarayıcı → "/api" (aynı sitedeki BFF; token çerezde, tarayıcı görmez)
 *   sunucu   → API'nin kendisi (loader'lar token'ı serverRequestInit ile ekler)
 */
export function configureApi() {
  const isServer = typeof window === 'undefined';
  configureApiClient({
    baseUrl: isServer ? (process.env.API_URL ?? 'http://localhost:5165') : '/api',
    // İstek dili = sayfanın dili (<html lang>, root.tsx'te adresten gelir). Sunucuda loader'lar kendi başlığını ekler.
    getLanguage: () => (isServer ? undefined : document.documentElement.lang),
    credentials: 'same-origin',
  });
}

// ako:begin auth
/** Çıkış: BFF çerezi siler; sayfa yenilenince oturum yok. */
export async function logout(redirectTo = '/') {
  await fetch('/bff/logout', { method: 'POST' });
  window.location.assign(redirectTo);
}
// ako:end auth
