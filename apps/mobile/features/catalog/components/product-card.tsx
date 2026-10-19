import { Tag, Text, useTheme } from '@mari-ui/native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { RADIUS } from '~/shared/lib/brand';
import { productImage } from '../data/images';
import type { Product } from '../data/schema';
import { formatPrice, stockState, summary } from '../lib/product';
import { useT } from '~/features/localization/i18n';
import { Eyebrow, Heading, Muted } from '~/shared/components/ui';

/** Katalog ve ana sayfadaki ürün kartı; tamamı ürün detayına götürür. */
export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const { color } = useTheme();
  const t = useT();
  const stock = stockState(product.stock, t);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      style={({ pressed }) => ({
        width,
        flex: width ? undefined : 1,
        opacity: pressed ? 0.85 : 1,
        backgroundColor: color.canvas.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: color.canvas.border,
        overflow: 'hidden',
      })}
    >
      <View>
        <Image
          source={productImage(product)}
          contentFit="cover"
          transition={150}
          style={{ aspectRatio: 1, width: '100%', opacity: stock.available ? 1 : 0.55 }}
        />
        {stock.color !== 'success' ? (
          <View style={{ position: 'absolute', left: 10, top: 10 }}>
            <Tag color={stock.color} variant="solid">
              {stock.label}
            </Tag>
          </View>
        ) : null}
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Eyebrow>{t(`category.${product.category}`)}</Eyebrow>
        <Heading size={17}>{product.name}</Heading>
        <Muted size={13}>{summary(product.description)}</Muted>
        <Text weight="semibold" style={{ marginTop: 6 }}>
          {formatPrice(product.price)}
        </Text>
      </View>
    </Pressable>
  );
}
