import { isApiError } from '@ako/api-client';
import {
  getAdminListLanguagesQueryKey,
  getAdminListTranslationsQueryKey,
  useAdminCreateLanguage,
  useAdminDeleteLanguage,
  useAdminListLanguages,
  useAdminListTranslations,
  useAdminSetTranslation,
  useAdminUpdateLanguage,
} from '@ako/api-client/admin-localization';
import { getGetLanguagesQueryKey } from '@ako/api-client/localization';
import { useToast } from '@mari-ui/components/toast';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useT } from '~/shared/i18n/i18n-provider';

// Yönetilebilen çeviri alanı: yalnızca site metinleri. (API her alanı destekler; backoffice ve api metinleri
// yalnızca dosyadan gelir, arayüzde düzenlenmez.)
export const NAMESPACE = 'site';
export type Namespace = typeof NAMESPACE;

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

/** Birden çok hücreyi birlikte kaydeder; boş değer dosyadaki varsayılana döner (ezmeyi siler). */
export function useSaveTranslations(onSaved: () => void) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useT();
  const save = useAdminSetTranslation();

  return {
    isPending: save.isPending,
    saveAll: async (
      changes: { namespace: string; culture: string; key: string; value: string }[],
    ) => {
      try {
        for (const { value, ...rest } of changes) {
          await save.mutateAsync({ data: { ...rest, value: value.trim() ? value : null } });
        }
        showToast({
          title: t('translations.savedCount', { count: changes.length }),
          type: 'success',
        });
        onSaved();
      } catch (error) {
        showToast({
          title: isApiError(error) ? error.message : t('translations.failed'),
          type: 'error',
        });
      } finally {
        void queryClient.invalidateQueries({ queryKey: getAdminListTranslationsQueryKey() });
      }
    },
  };
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
    remove: useAdminDeleteLanguage({
      mutation: {
        onSuccess: () => {
          showToast({ title: t('translations.languages.deleted'), type: 'success' });
          refresh();
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
