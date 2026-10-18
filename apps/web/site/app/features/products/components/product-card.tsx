import type { ProductResponse } from '@ako/api-client/model';
import { CATEGORY_LABELS, formatPrice, productImageSrc, stockState } from '@ako/ui';
import { Tag } from '@mari-ui/components/tag';
import { Link } from 'react-router';

/**
 * Kartta gösterilecek kısa özet. Kahve açıklamaları "işlem. kavrum. tadım notaları." düzenindedir; satın alma
 * kararını en çok tadım notaları etkilediği için o cümle seçilir. Diğer ürünlerde ilk cümle gösterilir.
 */
function summary(description: string | null): string {
  if (!description) return '';
  const sentences = description.split('. ');
  return (sentences[2] ?? sentences[0] ?? '').replace(/\.$/, '');
}

/** Katalog ve ana sayfadaki ürün kartı. Kartın tamamı ürün detayına götürür. */
export function ProductCard({ product }: { product: ProductResponse }) {
  const stock = stockState(product.stock);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-mari-lg border border-mari-border bg-mari-surface transition-shadow duration-200 hover:shadow-mari-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
    >
      <div className="relative aspect-square overflow-hidden bg-mari-surface-alt">
        <img
          src={productImageSrc(product.imageUrl)}
          alt=""
          loading="lazy"
          width={800}
          height={800}
          className={`size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none ${stock.available ? '' : 'opacity-60 grayscale'}`}
        />
        {stock.color !== 'success' && (
          <Tag color={stock.color} variant="solid" className="absolute left-3 top-3">
            {stock.label}
          </Tag>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-mari-muted">
          {CATEGORY_LABELS[product.category]}
        </span>
        <h3 className="font-heading text-lg font-semibold leading-snug">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-mari-muted">{summary(product.description)}</p>
        <p className="mt-auto pt-3 text-base font-semibold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductResponse[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
