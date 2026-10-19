import { isApiError } from '@ako/api-client';
import type { ProductResponse } from '@ako/api-client/model';
import { getListTodosQueryKey, useCreateTodo } from '@ako/api-client/todos';
import { useToast } from '@mari-ui/components/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalePath, useT } from '~/shared/i18n/i18n-provider';

/**
 * Ürünü kullanıcının alışveriş listesine ekler. Alışveriş listesi, şablondaki "Todos" örnek özelliğinin bu
 * senaryodaki karşılığıdır: kullanıcıya özel, giriş gerektiren veri.
 */
export function useAddToList() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useT();
  const localePath = useLocalePath();
  const create = useCreateTodo({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        showToast({
          title: t('products.addedToList'),
          type: 'success',
          action: {
            label: t('products.openList'),
            onClick: () => window.location.assign(localePath('/list')),
          },
        });
      },
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : t('products.addFailed'),
          type: 'error',
        }),
    },
  });

  return {
    isPending: create.isPending,
    add: (product: ProductResponse) => create.mutate({ data: { title: product.name } }),
  };
}
