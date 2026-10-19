import { isApiError } from '@ako/api-client';
import type { ProductResponse, TodoResponse } from '@ako/api-client/model';
import {
  getListTodosQueryKey,
  useCreateTodo,
  useDeleteTodo,
  useListTodos,
  useUpdateTodo,
} from '@ako/api-client/todos';
import { useToast } from '@mari-ui/native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useT } from '~/features/localization/i18n';

/**
 * Alışveriş listesi: şablondaki "Todos" örnek özelliğinin bu senaryodaki karşılığı (kullanıcıya özel,
 * giriş gerektiren veri). Her değişiklikten sonra liste yeniden çekilir.
 */
export function useShoppingList(enabled: boolean) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });

  const list = useListTodos({ query: { enabled } });
  const update = useUpdateTodo({ mutation: { onSuccess: refresh } });
  const remove = useDeleteTodo({ mutation: { onSuccess: refresh } });
  const create = useCreateTodo({ mutation: { onSuccess: refresh } });

  return {
    todos: list.data ?? [],
    isLoading: list.isPending && enabled,
    isRefetching: list.isRefetching,
    refetch: () => list.refetch(),
    add: create.mutateAsync,
    isAdding: create.isPending,
    toggle: (todo: TodoResponse) =>
      update.mutate({ id: todo.id, data: { title: todo.title, isDone: !todo.isDone } }),
    remove: (todo: TodoResponse) => remove.mutate({ id: todo.id }),
    error: update.error ?? remove.error,
  };
}

/** Ürünü alışveriş listesine ekler; başarıda "Listeyi aç" eylemli bildirim gösterir. */
export function useAddToList() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const t = useT();
  const create = useCreateTodo({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        showToast({
          title: t('product.added'),
          type: 'success',
          action: { label: t('product.openList'), onPress: () => router.navigate('/list') },
        });
      },
      onError: (error) =>
        showToast({
          title: isApiError(error) ? error.message : t('product.addFailed'),
          type: 'error',
        }),
    },
  });

  return {
    isPending: create.isPending,
    add: (product: ProductResponse) => create.mutate({ data: { title: product.name } }),
  };
}
