import type { ProductResponse } from '@ako/api-client/model';
import { productImageSrc } from '@ako/ui';
import { Empty } from '@mari-ui/components/empty';
import { Tag } from '@mari-ui/components/tag';
import { Link } from 'react-router';

/** Tükenen ve azalan ürünler: önce tükenenler, sonra en az kalandan başlayarak. */
export function StockAlerts({
  outOfStock,
  lowStock,
}: {
  outOfStock: ProductResponse[];
  lowStock: ProductResponse[];
}) {
  const rows = [...outOfStock, ...lowStock];

  return (
    <section
      className="rounded-mari-lg border border-mari-border bg-mari-surface"
      aria-labelledby="stok-uyarilari"
    >
      <header className="flex items-center justify-between border-b border-mari-border px-5 py-4">
        <h2 id="stok-uyarilari" className="font-semibold">
          Stok uyarıları
        </h2>
        <Link to="/products" className="text-sm font-medium text-mari-primary">
          Ürünlere git
        </Link>
      </header>
      {rows.length === 0 ? (
        <div className="p-6">
          <Empty size="sm" title="Her şey stokta" description="Tükenen ya da azalan ürün yok." />
        </div>
      ) : (
        <ul className="divide-y divide-mari-border">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-5 py-3">
              <img
                src={productImageSrc(p.imageUrl)}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-mari-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-mari-muted">{p.sku}</p>
              </div>
              <Tag color={p.stock <= 0 ? 'error' : 'warning'} variant="soft">
                {p.stock <= 0 ? 'Tükendi' : `${p.stock} adet`}
              </Tag>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
