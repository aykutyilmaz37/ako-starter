import type { PagedResponseOfProductResponse, ProductResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Popconfirm } from '@mari-ui/components/popconfirm';
import { Table, type ColumnDef } from '@mari-ui/components/table';
import { useRemoveProduct } from '../hooks/use-products';

const price = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

interface ProductsTableProps {
  products: PagedResponseOfProductResponse | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function ProductsTable({ products, loading, onPageChange }: ProductsTableProps) {
  const remove = useRemoveProduct();

  const columns: ColumnDef<ProductResponse>[] = [
    { header: 'Ürün', columnName: 'name' },
    { header: 'SKU', columnName: 'sku' },
    {
      header: 'Fiyat',
      columnName: 'price',
      align: 'end',
      render: (_, row) => price.format(row.price),
    },
    { header: 'Stok', columnName: 'stock', align: 'end' },
    {
      header: '',
      columnName: 'id',
      align: 'end',
      render: (_, product) => (
        <Popconfirm
          title="Ürün silinsin mi?"
          description={product.name}
          okText="Sil"
          cancelText="Vazgeç"
          color="error"
          onConfirm={() => remove.mutate({ id: product.id })}
        >
          <Button size="sm" variant="ghost" color="error">
            Sil
          </Button>
        </Popconfirm>
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
      emptyState={{ title: 'Ürün bulunamadı' }}
    />
  );
}
