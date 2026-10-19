import { isApiError } from '@ako/api-client';
import {
  getAdminListLanguagesQueryKey,
  getAdminListTranslationsQueryKey,
  useAdminCreateLanguage,
  useAdminListLanguages,
  useAdminListTranslations,
  useAdminSetTranslation,
  useAdminUpdateLanguage,
} from '@ako/api-client/admin-localization';
import { getGetLanguagesQueryKey } from '@ako/api-client/localization';
import { useToast } from '@mari-ui/components/toast';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useT } from '~/shared/i18n/i18n-provider';

export const NAMESPACES = ['site', 'backoffice', 'api'] as const;
export type Namespace = (typeof NAMESPACES)[number];

/** Sayfalı çeviri satırları (anahtar + dil başına değer); sayfa değişirken eski veri ekranda kalır. */
export function useTranslations(params: {
  namespace: Namespace;
  search?: string;
  onlyMissing?: boolean;
  page: number;
  pageSize: number;
}) {
  return useAdminListTranslations(params, { query: { placeholderData: keepPreviousData } });
}

/** Tüm diller (kapalılar dahil); tablodaki sütunlar bunlardır. */
export function useLanguages() {
  return useAdminListLanguages();
}

/** Bir hücreyi kaydeder; boş değer dosyadaki varsayılana döner (ezmeyi siler). */
export function useSaveTranslation(onSaved: () => void) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useT();

  return useAdminSetTranslation({
    mutation: {
      onSuccess: () => {
        showToast({ title: t('translations.saved'), type: 'success' });
        void queryClient.invalidateQueries({ queryKey: getAdminListTranslationsQueryKey() });
        onSaved();
      },
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : t('translations.failed'),
          type: 'error',
        }),
    },
  });
}

/** Dil ekleme ve açıp kapama; site/backoffice dil seçicilerinin kullandığı herkese açık liste de yenilenir. */
export function useSaveLanguage(onSaved?: () => void) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useT();
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: getAdminListLanguagesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetLanguagesQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getAdminListTranslationsQueryKey() });
  };
  const onError = (error: unknown) =>
    showToast({
      title: isApiError(error) ? error.message : t('translations.languages.failed'),
      type: 'error',
    });

  return {
    create: useAdminCreateLanguage({
      mutation: {
        onSuccess: () => {
          showToast({ title: t('translations.languages.added'), type: 'success' });
          refresh();
          onSaved?.();
        },
        onError,
      },
    }),
    update: useAdminUpdateLanguage({
      mutation: {
        onSuccess: () => {
          showToast({ title: t('translations.languages.updated'), type: 'success' });
          refresh();
        },
        onError,
      },
    }),
  };
}
