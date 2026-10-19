import type { ProductCategory } from '@ako/api-client/model';
import { Card, CardMeta } from '@mari-ui/components/card';
import { Image } from '@mari-ui/components/image';
import { List } from '@mari-ui/components/list';
import { CATEGORY_LABELS, productImageSrc } from '~/shared/catalog';

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
    <List
      aria-label="Kategoriler"
      dataSource={tiles}
      rowKey="category"
      grid={{ columns: { base: 1, md: 3 }, gap: 'lg' }}
      renderItem={(tile) => (
        <Card href={`/products?category=${tile.category}`} hoverable className="h-full">
          <CardMeta
            avatar={
              <Image
                src={productImageSrc(tile.imageUrl)}
                alt=""
                width={96}
                height={96}
                fit="cover"
                loading="lazy"
                wrapperClassName="overflow-hidden rounded-mari-md"
              />
            }
            title={CATEGORY_LABELS[tile.category]}
            description={`${blurbs[tile.category]} · ${tile.count} ürün`}
          />
        </Card>
      )}
    />
  );
}
