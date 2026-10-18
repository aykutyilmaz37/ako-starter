import { isApiError } from '@ako/api-client';
import type { ProductCategory } from '@ako/api-client/model';
import {
  useAdminCreateProduct,
  useAdminDeleteProduct,
  useAdminUpdateProduct,
} from '@ako/api-client/admin-products';
import { getListProductsQueryKey, useListProducts } from '@ako/api-client/products';
import { useToast } from '@mari-ui/components/toast';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';

export function useProducts(params: {
  page: number;
  pageSize: number;
  search?: string;
  category?: ProductCategory;
}) {
  return useListProducts(params, { query: { placeholderData: keepPreviousData } });
}

/** Ürünü siler (/admin/products), bildirir ve listeyi yeniler. */
export function useRemoveProduct() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useAdminDeleteProduct({
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

/**
 * Ürün ekleme ve güncelleme (/admin/products). Başarıda bildirir ve listeyi yeniler; hatayı formun işlemesi için çağırana bırakır
 * (alan hataları forma, SKU çakışması gibi iş hataları bildirime).
 */
export function useSaveProduct(onSaved: () => void, onError: (error: unknown) => void) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const mutation = {
    onSuccess: () => {
      showToast({ title: 'Ürün kaydedildi.', type: 'success' });
      void queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      onSaved();
    },
    onError,
  };

  return {
    create: useAdminCreateProduct({ mutation }),
    update: useAdminUpdateProduct({ mutation }),
  };
}
