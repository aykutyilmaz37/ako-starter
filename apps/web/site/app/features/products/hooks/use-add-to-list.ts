import { isApiError } from '@ako/api-client';
import type { ProductResponse } from '@ako/api-client/model';
import { getListTodosQueryKey, useCreateTodo } from '@ako/api-client/todos';
import { useToast } from '@mari-ui/components/toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Ürünü kullanıcının alışveriş listesine ekler. Alışveriş listesi, şablondaki "Todos" örnek özelliğinin bu
 * senaryodaki karşılığıdır: kullanıcıya özel, giriş gerektiren veri.
 */
export function useAddToList() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const create = useCreateTodo({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        showToast({
          title: 'Listenize eklendi.',
          type: 'success',
          action: { label: 'Listeyi aç', onClick: () => window.location.assign('/list') },
        });
      },
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : 'Listeye eklenemedi.',
          type: 'error',
        }),
    },
  });

  return {
    isPending: create.isPending,
    add: (product: ProductResponse) => create.mutate({ data: { title: product.name } }),
  };
}
