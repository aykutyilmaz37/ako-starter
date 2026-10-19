import type { ProductCategory } from '@ako/api-client/model';
import { Card, CardMeta } from '@mari-ui/components/card';
import { Image } from '@mari-ui/components/image';
import { List } from '@mari-ui/components/list';
import { productImageSrc } from '~/shared/catalog';
import { useLocalePath, useT } from '~/shared/i18n/i18n-provider';

export interface CategoryTile {
  category: ProductCategory;
  count: number;
  imageUrl: string | null;
}

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  const t = useT();
  const localePath = useLocalePath();

  return (
    <List
      aria-label={t('home.categories.label')}
      dataSource={tiles}
      rowKey="category"
      grid={{ columns: { base: 1, md: 3 }, gap: 'lg' }}
      renderItem={(tile) => (
        <Card href={localePath(`/products?category=${tile.category}`)} hoverable className="h-full">
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
            title={t(`category.${tile.category}`)}
            description={t('home.categories.description', {
              blurb: t(`home.categories.${tile.category}`),
              count: tile.count,
            })}
          />
        </Card>
      )}
    />
  );
}
