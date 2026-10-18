import type { ProductResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { SearchInput } from '@mari-ui/components/input';
import { Title } from '@mari-ui/components/typography';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ProductFormModal } from '../components/product-form-modal';
import { ProductsTable } from '../components/products-table';
import { useProducts } from '../hooks/use-products';

// ÖRNEK SAYFA: yönetim tablosu; ekleme/düzenleme (modal) + yalnızca Admin'in yapabildiği silme.
// Projede gerekmiyorsa features/products'ı silin.

export function meta() {
  return [{ title: 'Ürünler | Ako Backoffice' }];
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? undefined;
  const products = useProducts({ page, pageSize: 20, search });
  // undefined: modal kapalı, null: yeni ürün, ürün: düzenleme
  const [editing, setEditing] = useState<ProductResponse | null | undefined>(undefined);

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Ürünler</Title>
        <Button color="primary" onClick={() => setEditing(null)}>
          Yeni ürün
        </Button>
      </div>
      <SearchInput
        placeholder="Ad ya da SKU ile ara"
        defaultValue={search ?? ''}
        onSearch={(value) => setParam('search', value || undefined)}
      />
      <ProductsTable
        products={products.data}
        loading={products.isFetching}
        onPageChange={(p) => setParam('page', String(p))}
        onEdit={setEditing}
      />
      <ProductFormModal
        open={editing !== undefined}
        product={editing}
        onClose={() => setEditing(undefined)}
      />
    </section>
  );
}
