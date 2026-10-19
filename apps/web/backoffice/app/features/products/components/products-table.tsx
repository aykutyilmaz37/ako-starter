import type { PagedResponseOfProductResponse, ProductResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Image } from '@mari-ui/components/image';
import { Popconfirm } from '@mari-ui/components/popconfirm';
import { Table, type ColumnDef } from '@mari-ui/components/table';
import { Tag } from '@mari-ui/components/tag';
import { Text } from '@mari-ui/components/typography';
import { Pencil, Trash2 } from 'lucide-react';
import { useRemoveProduct } from '~/features/products/hooks/use-products';
import { formatPrice, productImageSrc } from '~/shared/catalog';
import { useI18n } from '~/shared/i18n/i18n-provider';

interface ProductsTableProps {
  products: PagedResponseOfProductResponse | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (product: ProductResponse) => void;
}

export function ProductsTable({ products, loading, onPageChange, onEdit }: ProductsTableProps) {
  const remove = useRemoveProduct();
  const { lang, t } = useI18n();

  const columns: ColumnDef<ProductResponse>[] = [
    {
      header: t('products.col.product'),
      columnName: 'name',
      render: (_, p) => (
        <div className="flex items-center gap-3">
          <Image
            src={productImageSrc(p.imageUrl)}
            alt=""
            width={40}
            height={40}
            fit="cover"
            wrapperClassName="shrink-0 overflow-hidden rounded-mari-md"
          />
          <div className="min-w-0">
            <Text weight="medium" ellipsis className="block">
              {p.name}
            </Text>
            <Text muted className="block text-xs">
              {p.sku}
            </Text>
          </div>
        </div>
      ),
    },
    {
      header: t('products.col.category'),
      columnName: 'category',
      render: (_, p) => (
        <Tag variant="outline" color="neutral">
          {t(`category.${p.category}`)}
        </Tag>
      ),
    },
    {
      header: t('products.col.price'),
      columnName: 'price',
      align: 'end',
      render: (_, p) => <span className="tabular-nums">{formatPrice(p.price, lang)}</span>,
    },
    {
      header: t('products.col.stock'),
      columnName: 'stock',
      align: 'end',
      render: (_, p) => {
        return (
          <span className="inline-flex items-center gap-2">
            <span className="tabular-nums">{p.stock}</span>
            {p.stock <= 10 && (
              <Tag color={p.stock <= 0 ? 'error' : 'warning'} variant="soft">
                {p.stock <= 0 ? t('products.soldOut') : t('products.few')}
              </Tag>
            )}
          </span>
        );
      },
    },
    {
      header: '',
      columnName: 'id',
      align: 'end',
      render: (_, product) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            icon={<Pencil size={16} aria-hidden />}
            aria-label={t('products.edit', { name: product.name })}
            onClick={() => onEdit(product)}
          />
          <Popconfirm
            title={t('products.confirmDelete')}
            description={product.name}
            okText={t('products.deleteButton')}
            cancelText={t('common.cancel')}
            color="error"
            onConfirm={() => remove.mutate({ id: product.id })}
          >
            <Button
              size="sm"
              variant="ghost"
              color="error"
              icon={<Trash2 size={16} aria-hidden />}
              aria-label={t('products.delete', { name: product.name })}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      label={t('products.table')}
      data={products?.items ?? []}
      columns={columns}
      skeleton={loading && !products}
      paginationMode="server"
      pagination={{
        page: products?.page ?? 1,
        pageSize: products?.pageSize ?? 20,
        total: products?.totalCount ?? 0,
        onPageChange,
      }}
      emptyState={{
        title: t('products.empty.title'),
        description: t('products.empty.description'),
      }}
    />
  );
}
