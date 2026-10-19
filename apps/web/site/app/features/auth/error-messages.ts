import type { TranslationKey } from '~/shared/i18n/i18n';

/** Sosyal giriş dönüşünde (?error=…) ve BFF'te gelen hata kodlarının çeviri anahtarı. */
export const AUTH_ERROR_KEYS: Record<string, TranslationKey> = {
  'auth.email_in_use': 'auth.error.email_in_use',
  'auth.external_failed': 'auth.error.external_failed',
  'auth.provider_unavailable': 'auth.error.provider_unavailable',
  'auth.role_required': 'auth.error.role_required',
};
