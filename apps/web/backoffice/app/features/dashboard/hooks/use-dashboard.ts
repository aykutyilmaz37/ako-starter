import { useAdminListUsers } from '@ako/api-client/admin-users';
import { useListProducts } from '@ako/api-client/products';

const LOW_STOCK = 10;

/**
 * Genel bakış verisi. Örnek mağaza küçük olduğu için ürünler tek istekte (en fazla 100) alınıp tarayıcıda özetlenir;
 * gerçek bir projede bu sayılar API'de ayrı bir /admin/stats endpoint'iyle hesaplanmalı.
 */
export function useDashboard() {
  const products = useListProducts({ pageSize: 100 });
  const users = useAdminListUsers({ pageSize: 5 });
  const items = products.data?.items ?? [];

  return {
    isLoading: products.isLoading || users.isLoading,
    productCount: products.data?.totalCount ?? 0,
    outOfStock: items.filter((p) => p.stock <= 0),
    lowStock: items
      .filter((p) => p.stock > 0 && p.stock <= LOW_STOCK)
      .sort((a, b) => a.stock - b.stock),
    stockValue: items.reduce((sum, p) => sum + p.price * Math.max(p.stock, 0), 0),
    userCount: users.data?.totalCount ?? 0,
    recentUsers: users.data?.items ?? [],
  };
}
