import type { TranslationKey } from '~/shared/i18n/i18n';

/** BFF ve API'den gelen hata kodlarının çeviri anahtarı. */
export const AUTH_ERROR_KEYS: Record<string, TranslationKey> = {
  'auth.role_required': 'auth.error.role_required',
  'auth.external_failed': 'auth.error.external_failed',
};
