import type { PagedResponseOfProductResponse, ProductResponse } from '@ako/api-client/model';
import { CATEGORY_LABELS, formatPrice, productImageSrc, stockState } from '@ako/ui';
import { Button } from '@mari-ui/components/button';
import { Popconfirm } from '@mari-ui/components/popconfirm';
import { Table, type ColumnDef } from '@mari-ui/components/table';
import { Tag } from '@mari-ui/components/tag';
import { Pencil, Trash2 } from 'lucide-react';
import { useRemoveProduct } from '../hooks/use-products';

interface ProductsTableProps {
  products: PagedResponseOfProductResponse | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (product: ProductResponse) => void;
}

export function ProductsTable({ products, loading, onPageChange, onEdit }: ProductsTableProps) {
  const remove = useRemoveProduct();

  const columns: ColumnDef<ProductResponse>[] = [
    {
      header: 'Ürün',
      columnName: 'name',
      render: (_, p) => (
        <div className="flex items-center gap-3">
          <img
            src={productImageSrc(p.imageUrl)}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-mari-md bg-mari-surface-alt object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="text-xs text-mari-muted">{p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Kategori',
      columnName: 'category',
      render: (_, p) => (
        <Tag variant="outline" color="neutral">
          {CATEGORY_LABELS[p.category]}
        </Tag>
      ),
    },
    {
      header: 'Fiyat',
      columnName: 'price',
      align: 'end',
      render: (_, p) => <span className="tabular-nums">{formatPrice(p.price)}</span>,
    },
    {
      header: 'Stok',
      columnName: 'stock',
      align: 'end',
      render: (_, p) => {
        const s = stockState(p.stock);
        return (
          <span className="inline-flex items-center gap-2">
            <span className="tabular-nums">{p.stock}</span>
            {s.color !== 'success' && (
              <Tag color={p.stock <= 0 ? 'error' : 'warning'} variant="soft">
                {p.stock <= 0 ? 'Tükendi' : 'Az'}
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
            aria-label={`${product.name} düzenle`}
            onClick={() => onEdit(product)}
          />
          <Popconfirm
            title="Ürün silinsin mi?"
            description={product.name}
            okText="Sil"
            cancelText="Vazgeç"
            color="error"
            onConfirm={() => remove.mutate({ id: product.id })}
          >
            <Button
              size="sm"
              variant="ghost"
              color="error"
              icon={<Trash2 size={16} aria-hidden />}
              aria-label={`${product.name} sil`}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table
      label="Ürünler"
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
        title: 'Ürün bulunamadı',
        description: 'Farklı bir arama ya da kategori deneyin.',
      }}
    />
  );
}
