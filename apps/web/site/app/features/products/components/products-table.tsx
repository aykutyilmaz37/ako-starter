import type { PagedResponseOfProductResponse, ProductResponse } from '@ako/api-client/model';
import { Table, type ColumnDef } from '@mari-ui/components/table';

const price = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

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
];

interface ProductsTableProps {
  products: PagedResponseOfProductResponse;
  loading: boolean;
  onPageChange: (page: number) => void;
}

/** Sunucu taraflı sayfalanan ürün tablosu. */
export function ProductsTable({ products, loading, onPageChange }: ProductsTableProps) {
  return (
    <Table
      label="Ürünler"
      data={products.items}
      columns={columns}
      skeleton={loading}
      paginationMode="server"
      pagination={{
        page: products.page,
        pageSize: products.pageSize,
        total: products.totalCount,
        onPageChange,
      }}
      emptyState={{ title: 'Ürün bulunamadı' }}
    />
  );
}
