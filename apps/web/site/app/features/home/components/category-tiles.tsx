import type { ProductCategory } from '@ako/api-client/model';
import { CATEGORY_LABELS, productImageSrc } from '@ako/ui';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export interface CategoryTile {
  category: ProductCategory;
  count: number;
  imageUrl: string | null;
}

const blurbs: Record<ProductCategory, string> = {
  Coffee: 'Tek menşeli çekirdekler ve espresso harmanımız.',
  Equipment: 'V60, değirmen ve su ısıtıcısı: evde kafe kalitesi.',
  Accessory: 'Terazi, filtre ve kupalar.',
};

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {tiles.map((tile) => (
        <li key={tile.category}>
          <Link
            to={`/products?category=${tile.category}`}
            className="group flex h-full items-center gap-5 rounded-mari-lg border border-mari-border bg-mari-surface p-5 transition-shadow hover:shadow-mari-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
          >
            <img
              src={productImageSrc(tile.imageUrl)}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              className="size-24 shrink-0 rounded-mari-md object-cover"
            />
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-xl font-semibold">
                {CATEGORY_LABELS[tile.category]}
              </h3>
              <p className="text-sm text-mari-muted">{blurbs[tile.category]}</p>
              <span className="mt-1 flex items-center gap-1 text-sm font-medium text-mari-primary">
                {tile.count} ürün
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
