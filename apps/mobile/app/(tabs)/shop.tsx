import type { ProductCategory } from '@ako/api-client/model';
import { useListProducts } from '@ako/api-client/products';
import { Empty, SearchInput, Text, useTheme } from '@mari-ui/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '~/components/product-card';
import { Eyebrow, Heading, Muted } from '~/components/ui';
import { CATEGORIES, CATEGORY_NAMES, RADIUS } from '~/lib/brand';

/** Mağaza: arama + kategori çipleri + iki sütunlu ürün ızgarası. */
export default function Shop() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = CATEGORIES.find((c) => c === params.category);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');

  // Yazarken her tuşta istek atmamak için kısa gecikme.
  useEffect(() => {
    const id = setTimeout(() => setSearch(text.trim()), 300);
    return () => clearTimeout(id);
  }, [text]);

  const products = useListProducts({ category, search: search || undefined, pageSize: 48 });
  const items = products.data?.items ?? [];

  const select = (next?: ProductCategory) =>
    router.setParams({ category: next } as { category?: string });

  return (
    <FlatList
      data={items}
      keyExtractor={(p) => p.id}
      numColumns={2}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 14 }}
      columnWrapperStyle={{ gap: 14 }}
      refreshing={products.isRefetching}
      onRefresh={() => void products.refetch()}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 6 }}>
          <View style={{ gap: 4 }}>
            <Eyebrow>Mağaza</Eyebrow>
            <Heading size={32}>{category ? CATEGORY_NAMES[category] : 'Tüm ürünler'}</Heading>
          </View>
          <SearchInput
            value={text}
            onChangeText={setText}
            placeholder="Ürün ya da menşe ara"
            accessibilityLabel="Ürünlerde ara"
          />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[undefined, ...CATEGORIES].map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c ?? 'all'}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  hitSlop={6}
                  onPress={() => select(c)}
                  style={{
                    minHeight: 40,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    borderRadius: RADIUS.xl,
                    borderWidth: 1,
                    borderColor: active ? color.primary.solid : color.canvas.border,
                    backgroundColor: active ? color.primary.solid : color.canvas.surface,
                  }}
                >
                  <Text
                    weight="semibold"
                    style={{
                      color: active ? color.primary.solidContrast : color.canvas.foreground,
                    }}
                  >
                    {c ? CATEGORY_NAMES[c] : 'Tümü'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {products.data ? <Muted size={13}>{`${products.data.totalCount} ürün`}</Muted> : null}
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
      ListEmptyComponent={
        products.isPending ? null : products.isError ? (
          <Empty
            title="Ürünler alınamadı"
            description="Bağlantını kontrol edip aşağı çekerek yenile."
          />
        ) : (
          <Empty title="Ürün bulunamadı" description="Farklı bir arama ya da kategori deneyin." />
        )
      }
    />
  );
}
