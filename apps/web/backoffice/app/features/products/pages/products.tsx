import type { ProductCategory, ProductResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { SearchInput } from '@mari-ui/components/input';
import { Segmented } from '@mari-ui/components/segmented';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '~/shared/page-header';
import { CATEGORIES } from '~/shared/catalog';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import type { Route } from './+types/products';
import { ProductFormModal } from '~/features/products/components/product-form-modal';
import { ProductsTable } from '~/features/products/components/products-table';
import { useProducts } from '~/features/products/hooks/use-products';

// ÖRNEK SAYFA: yönetim tablosu; ekleme/düzenleme (modal), silme. Tüm yazma işlemleri /admin/products'a gider.
// Projede gerekmiyorsa features/products'ı silin.

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('products.meta') }];
}

const ALL = 'all';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const t = useT();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? undefined;
  const category = CATEGORIES.find((c) => c === params.get('category'));
  const products = useProducts({ page, pageSize: 20, search, category });
  // undefined: modal kapalı, null: yeni ürün, ürün: düzenleme. ?new=1 ile (ör. Genel bakıştan) yeni ürün açılır.
  const [editing, setEditing] = useState<ProductResponse | null | undefined>(
    params.has('new') ? null : undefined,
  );

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    next.delete('new');
    setParams(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
        actions={
          <Button
            color="primary"
            icon={<Plus size={16} aria-hidden />}
            onClick={() => setEditing(null)}
          >
            {t('products.new')}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Segmented
          name="category"
          aria-label={t('products.filter.name')}
          size="sm"
          value={category ?? ALL}
          onChange={(v) => setParam('category', v === ALL ? undefined : String(v))}
          options={[
            { value: ALL, label: t('products.filter.all') },
            ...CATEGORIES.map((c: ProductCategory) => ({ value: c, label: t(`category.${c}`) })),
          ]}
        />
        <div className="w-full md:max-w-xs">
          <SearchInput
            size="sm"
            placeholder={t('products.search.placeholder')}
            defaultValue={search ?? ''}
            onSearch={(value) => setParam('search', value || undefined)}
            aria-label={t('products.search.label')}
          />
        </div>
      </div>

      <div className="rounded-mari-lg border border-mari-border bg-mari-surface">
        <ProductsTable
          products={products.data}
          loading={products.isFetching}
          onPageChange={(p) => setParam('page', String(p))}
          onEdit={setEditing}
        />
      </div>

      <ProductFormModal
        open={editing !== undefined}
        product={editing}
        onClose={() => setEditing(undefined)}
      />
    </div>
  );
}
