import {
  getListTodosQueryKey,
  useCreateTodo,
  useDeleteTodo,
  useListTodos,
  useUpdateTodo,
} from '@ako/api-client/todos';
import type { TodoResponse } from '@ako/api-client/model';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Görev listesi ve işlemleri. Her değişiklikten sonra liste yeniden çekilir.
 * Bileşenler API'yi doğrudan değil bu hook üzerinden kullanır.
 */
export function useTodos() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });

  const list = useListTodos();
  const update = useUpdateTodo({ mutation: { onSuccess: refresh } });
  const remove = useDeleteTodo({ mutation: { onSuccess: refresh } });

  return {
    todos: list.data ?? [],
    isLoading: list.isLoading,
    toggle: (todo: TodoResponse) =>
      update.mutate({ id: todo.id, data: { title: todo.title, isDone: !todo.isDone } }),
    remove: (todo: TodoResponse) => remove.mutate({ id: todo.id }),
    refresh,
  };
}

/** Yeni görev ekleme; formun kendi başarı/hata işlemleri için ayrı. */
export function useCreateTodoWithRefresh(options: Parameters<typeof useCreateTodo>[0] = {}) {
  const queryClient = useQueryClient();
  return useCreateTodo({
    ...options,
    mutation: {
      ...options.mutation,
      onSuccess: (...args) => {
        void queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        options.mutation?.onSuccess?.(...args);
      },
    },
  });
}
