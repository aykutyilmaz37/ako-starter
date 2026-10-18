import { SearchInput } from '@mari-ui/components/input';
import { Title } from '@mari-ui/components/typography';
import { useSearchParams } from 'react-router';
import { ProductsTable } from '../components/products-table';
import { useProducts } from '../hooks/use-products';

// ÖRNEK SAYFA: yönetim tablosu + yalnızca Admin'in yapabildiği silme. Projede gerekmiyorsa features/products'ı silin.

export function meta() {
  return [{ title: 'Ürünler | Ako Backoffice' }];
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? undefined;
  const products = useProducts({ page, pageSize: 20, search });

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <section className="flex flex-col gap-6">
      <Title level={2}>Ürünler</Title>
      <SearchInput
        placeholder="Ad ya da SKU ile ara"
        defaultValue={search ?? ''}
        onSearch={(value) => setParam('search', value || undefined)}
      />
      <ProductsTable
        products={products.data}
        loading={products.isFetching}
        onPageChange={(p) => setParam('page', String(p))}
      />
    </section>
  );
}
