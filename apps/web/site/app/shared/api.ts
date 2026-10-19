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
    getLanguage: () => 'tr',
    credentials: 'same-origin',
  });
}

/** Çıkış: BFF çerezi siler; sayfa yenilenince oturum yok. */
export async function logout(redirectTo = '/') {
  await fetch('/bff/logout', { method: 'POST' });
  window.location.assign(redirectTo);
}
