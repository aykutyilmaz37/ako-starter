import { isApiError } from '@ako/api-client';
import {
  getListProductsQueryKey,
  useDeleteProduct,
  useListProducts,
} from '@ako/api-client/products';
import { useToast } from '@mari-ui/components/toast';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';

export function useProducts(params: { page: number; pageSize: number; search?: string }) {
  return useListProducts(params, { query: { placeholderData: keepPreviousData } });
}

/** Ürünü siler (API'de yalnızca Admin), bildirir ve listeyi yeniler. */
export function useRemoveProduct() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useDeleteProduct({
    mutation: {
      onSuccess: () => {
        showToast({ title: 'Ürün silindi.', type: 'success' });
        void queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      },
      onError: (error) =>
        showToast({ title: isApiError(error) ? error.message : 'Ürün silinemedi.', type: 'error' }),
    },
  });
}
