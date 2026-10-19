import type { ProductResponse } from '@ako/api-client/model';
import { Card } from '@mari-ui/components/card';
import { Image } from '@mari-ui/components/image';
import { List } from '@mari-ui/components/list';
import { Tag } from '@mari-ui/components/tag';
import { Text, Title } from '@mari-ui/components/typography';
import { formatPrice, productImageSrc, stockState } from '~/shared/catalog';
import { useI18n, useLocalePath, useT } from '~/shared/i18n/i18n-provider';

/**
 * Kartta gösterilecek kısa özet. Kahve açıklamaları "işlem. kavrum. tadım notaları." düzenindedir; satın alma
 * kararını en çok tadım notaları etkilediği için o cümle seçilir. Diğer ürünlerde ilk cümle gösterilir.
 */
function summary(description: string | null): string {
  if (!description) return '';
  const sentences = description.split('. ');
  return (sentences[2] ?? sentences[0] ?? '').replace(/\.$/, '');
}

/** Katalog ve ana sayfadaki ürün kartı; kartın tamamı ürün detayına götürür. */
export function ProductCard({ product }: { product: ProductResponse }) {
  const { lang, t } = useI18n();
  const localePath = useLocalePath();
  const stock = stockState(product.stock, t);

  return (
    <Card
      href={localePath(`/products/${product.id}`)}
      hoverable
      className="h-full"
      cover={
        <div className="relative">
          <Image
            src={productImageSrc(product.imageUrl)}
            alt=""
            aspectRatio={1}
            fit="cover"
            loading="lazy"
            // Tükenen ürün soluk: sarmalayıcıya verilir, Image'ın kendi yükleme geçişiyle (opacity) çakışmasın.
            wrapperClassName={stock.available ? undefined : 'opacity-60 grayscale'}
          />
          {stock.color !== 'success' && (
            <Tag color={stock.color} variant="solid" className="absolute left-3 top-3">
              {stock.label}
            </Tag>
          )}
        </div>
      }
    >
      <div className="flex h-full flex-col gap-1">
        <Text muted className="text-xs font-semibold uppercase tracking-wider">
          {t(`category.${product.category}`)}
        </Text>
        <Title level={3} className="text-lg leading-snug">
          {product.name}
        </Title>
        <Text muted className="line-clamp-2 text-sm">
          {summary(product.description)}
        </Text>
        <Text weight="semibold" className="mt-auto pt-3">
          {formatPrice(product.price, lang)}
        </Text>
      </div>
    </Card>
  );
}

/** Ürün ızgarası: dar ekranda 2, geniş ekranda 4 sütun. */
export function ProductGrid({ products }: { products: ProductResponse[] }) {
  const t = useT();

  return (
    <List
      aria-label={t('products.list.label')}
      dataSource={products}
      rowKey="id"
      grid={{ columns: { base: 2, lg: 4 }, gap: 'md' }}
      renderItem={(product) => <ProductCard product={product} />}
    />
  );
}
