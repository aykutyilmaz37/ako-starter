import { useMemo } from 'react';
import { getProduct, listProducts, type ProductFilter } from './queries';

// Ekranlar API'li sürümle aynı biçimde (`data`, `isPending`, `isError`...) okur; veri paketli olduğu için
// yükleme ya da hata durumu yoktur. API ile yerel veri arasında çalışma zamanında geçiş yoktur (DECISIONS.md).

export function useListProducts({ category, search, pageSize }: ProductFilter = {}) {
  const data = useMemo(
    () => listProducts({ category, search, pageSize }),
    [category, search, pageSize],
  );
  return {
    data,
    isPending: false,
    isError: false,
    isRefetching: false,
    refetch: () => Promise.resolve(),
  };
}

export function useGetProduct(id: string) {
  const data = useMemo(() => getProduct(id), [id]);
  return { data, isPending: false, isError: data === undefined };
}
