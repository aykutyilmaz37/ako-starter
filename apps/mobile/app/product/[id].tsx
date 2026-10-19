import { useGetProduct } from '@ako/api-client/products';
import { Button, Empty, Paragraph, Tag, Text, useTheme } from '@mari-ui/native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Plus, RefreshCcw, Truck } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Heading, Muted } from '~/components/ui';
import { RADIUS, formatPrice, imageSource, stockState } from '~/lib/brand';
import { useT } from '~/lib/i18n';
import { useAddToList } from '~/lib/todos';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  const addToList = useAddToList();
  const { data: product, isPending, isError } = useGetProduct(id);

  const back = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      hitSlop={10}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color.canvas.surface,
        borderWidth: 1,
        borderColor: color.canvas.border,
        zIndex: 5,
      }}
    >
      <ArrowLeft size={20} color={color.canvas.foreground} />
    </Pressable>
  );

  if (isPending || isError || !product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {back}
        {isPending ? null : <Empty title={t('product.notFound')} />}
      </View>
    );
  }

  const stock = stockState(product.stock, t);
  const promises = [
    { icon: Truck, text: t('product.promise.shipping') },
    { icon: Clock, text: t('product.promise.fast') },
    { icon: RefreshCcw, text: t('product.promise.exchange') },
  ];

  return (
    <View style={{ flex: 1 }}>
      {back}
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Image
          source={imageSource(product.imageUrl)}
          contentFit="cover"
          style={{ width: '100%', aspectRatio: 1, backgroundColor: color.canvas.surfaceAlt }}
        />
        <View style={{ padding: 20, gap: 14 }}>
          <View style={{ gap: 6 }}>
            <Eyebrow>{t(`category.${product.category}`)}</Eyebrow>
            <Heading size={32}>{product.name}</Heading>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text weight="semibold" style={{ fontSize: 22 }}>
              {formatPrice(product.price)}
            </Text>
            <Tag color={stock.color} variant="soft">
              {stock.label}
            </Tag>
          </View>
          {product.description ? <Paragraph muted>{product.description}</Paragraph> : null}

          {!stock.available ? (
            <Button block size="lg" disabled>
              {t('product.unavailable')}
            </Button>
          ) : (
            <Button
              block
              size="lg"
              loading={addToList.isPending}
              icon={<Plus size={18} color={color.primary.solidContrast} />}
              onPress={() => addToList.add(product)}
            >
              {t('product.add')}
            </Button>
          )}

          <View
            style={{
              marginTop: 8,
              padding: 16,
              gap: 14,
              borderRadius: RADIUS.lg,
              backgroundColor: color.canvas.surfaceAlt,
              borderWidth: 1,
              borderColor: color.canvas.border,
            }}
          >
            {promises.map(({ icon: Icon, text }) => (
              <View key={text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Icon size={18} color={color.primary.text} />
                <Text style={{ flex: 1 }}>{text}</Text>
              </View>
            ))}
          </View>
          <Muted size={12}>{t('product.sku', { sku: product.sku })}</Muted>
        </View>
      </ScrollView>
    </View>
  );
}
