import { configureApiClient } from '@ako/api-client';
import { API_URL } from '~/lib/config';
import { tokenStore } from '~/lib/token-store';

let onSessionExpired: () => void = () => {};

/** Oturum bitince (refresh de reddedilince) çağrılacak işlevi kök layout verir. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

let language = 'tr';

/** Seçili dil API'ye Accept-Language olarak gider (hata ve doğrulama mesajları o dilde döner). */
export function setApiLanguage(next: string): void {
  language = next;
}

// Modül yüklenirken bir kez: ilk istekten önce hazır olsun.
configureApiClient({
  baseUrl: API_URL,
  tokens: tokenStore,
  getLanguage: () => language,
  onSessionExpired: () => onSessionExpired(),
});
