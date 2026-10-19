import { configureApiClient } from '@ako/api-client';
import { API_URL } from '~/lib/config';
import { tokenStore } from '~/lib/token-store';

let onSessionExpired: () => void = () => {};

/** Oturum bitince (refresh de reddedilince) çağrılacak işlevi kök layout verir. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// Modül yüklenirken bir kez: ilk istekten önce hazır olsun.
configureApiClient({
  baseUrl: API_URL,
  tokens: tokenStore,
  getLanguage: () => 'tr', // Dil seçimi eklendiğinde (Aşama 2, çoklu dil maddesi) buradan okunur.
  onSessionExpired: () => onSessionExpired(),
});
