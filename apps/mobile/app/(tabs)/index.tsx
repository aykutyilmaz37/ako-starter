// ako:begin sample
import { Button } from '@mari-ui/native/button';
import { Tag } from '@mari-ui/native/tag';
import { useTheme } from '@mari-ui/native/theme';
import { Paragraph, Text } from '@mari-ui/native/typography';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowRight, BookOpen, Flame, Truck } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductCard } from '~/features/catalog/components/product-card';
import { Heading, Muted, SectionHeader } from '~/shared/components/ui';
import { useListProducts } from '~/features/catalog/data/hooks';
import { productImage } from '~/features/catalog/data/images';
import type { ProductCategory } from '~/features/catalog/data/schema';
import { CATEGORIES } from '~/features/catalog/lib/product';
import { RADIUS } from '~/shared/lib/brand';
import { useT } from '~/features/localization/i18n';
import { useSession } from '~/features/auth/session'; // ako:auth

function openShop(category?: ProductCategory) {
  router.navigate({ pathname: '/shop', params: category ? { category } : {} });
}

/** Ana sayfa: web sitesindeki sırayla hero, faydalar, bu haftanın kahveleri, kategoriler, hikâye. */
export default function Home() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  const { user } = useSession(); // ako:auth
  const featured = useListProducts({ category: 'Coffee', pageSize: 4 });
  const images = (featured.data?.items ?? []).slice(0, 3);

  const benefits = [
    { icon: Flame, title: t('home.benefits.roast.title'), text: t('home.benefits.roast.text') },
    {
      icon: Truck,
      title: t('home.benefits.shipping.title'),
      text: t('home.benefits.shipping.text'),
    },
    { icon: BookOpen, title: t('home.benefits.guide.title'), text: t('home.benefits.guide.text') },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Hero */}
      <View
        style={{
          backgroundColor: color.canvas.surfaceAlt,
          paddingTop: insets.top + 28,
          paddingHorizontal: 20,
          paddingBottom: 32,
          gap: 16,
        }}
      >
        <Tag color="primary" variant="soft">
          {t('home.hero.badge')}
        </Tag>
        <Heading size={38}>{t('home.hero.title')}</Heading>
        <Paragraph muted style={{ fontSize: 16, lineHeight: 24 }}>
          {t('home.hero.text')}
        </Paragraph>
        <View style={{ gap: 10 }}>
          <Button
            block
            size="lg"
            icon={<ArrowRight size={18} color={color.primary.solidContrast} />}
            iconPosition="end"
            onPress={() => openShop('Coffee')}
          >
            {t('home.hero.ctaCoffee')}
          </Button>
          <Button block size="lg" variant="outline" onPress={() => openShop('Equipment')}>
            {t('home.hero.ctaEquipment')}
          </Button>
        </View>
        <View style={{ height: 190, marginTop: 8 }} accessibilityElementsHidden>
          {images.map((p, i) => (
            <Image
              key={p.id}
              source={productImage(p)}
              contentFit="cover"
              style={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: RADIUS.xl,
                top: i === 1 ? 0 : 36,
                left: i === 0 ? '4%' : i === 1 ? '34%' : undefined,
                right: i === 2 ? '4%' : undefined,
                zIndex: i === 1 ? 2 : 1,
                transform: [{ rotate: i === 0 ? '-6deg' : i === 2 ? '6deg' : '0deg' }],
                borderWidth: 3,
                borderColor: color.canvas.surface,
              }}
            />
          ))}
        </View>
      </View>

      {/* Faydalar */}
      <View
        style={{
          padding: 20,
          gap: 18,
          borderBottomWidth: 1,
          borderBottomColor: color.canvas.border,
        }}
      >
        {benefits.map(({ icon: Icon, title, text }) => (
          <View key={title} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: color.primary.subtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} color={color.primary.subtleContrast} />
            </View>
            <View style={{ flex: 1 }}>
              <Text weight="semibold">{title}</Text>
              <Muted size={13}>{text}</Muted>
            </View>
          </View>
        ))}
      </View>

      {/* Bu haftanın kahveleri */}
      <View style={{ marginTop: 32, gap: 16 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <SectionHeader
            eyebrow={t('home.featured.eyebrow')}
            title={t('home.featured.title')}
            action={
              <Button variant="link" size="sm" onPress={() => openShop('Coffee')}>
                {t('home.featured.all')}
              </Button>
            }
          />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featured.data?.items ?? []}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
          renderItem={({ item }) => <ProductCard product={item} width={230} />}
          ListEmptyComponent={featured.isError ? <Muted>{t('home.loadFailed')}</Muted> : null}
        />
      </View>

      {/* Kategoriler */}
      <View style={{ marginTop: 36, paddingHorizontal: 20, gap: 16 }}>
        <SectionHeader title={t('home.categories.title')} />
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            accessibilityRole="link"
            accessibilityLabel={t(`category.${category}`)}
            onPress={() => openShop(category)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 12,
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: color.canvas.border,
              backgroundColor: color.canvas.surfaceAlt,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <CategoryThumb category={category} />
            <View style={{ flex: 1, gap: 2 }}>
              <Heading size={19}>{t(`category.${category}`)}</Heading>
              <Muted size={13}>{t(`categoryBlurb.${category}`)}</Muted>
            </View>
            <ArrowRight size={18} color={color.canvas.muted} />
          </Pressable>
        ))}
      </View>

      {/* Hikâye */}
      <View style={{ marginTop: 40, backgroundColor: color.primary.solid, padding: 24, gap: 14 }}>
        <Heading size={22} style={{ color: color.primary.solidContrast }}>
          {t('home.story.quote')}
        </Heading>
        <Text style={{ color: color.primary.solidContrast, opacity: 0.85 }}>
          {t('home.story.author')}
        </Text>
        {/* ako:begin auth */}
        {user ? null : (
          <Button
            variant="outline"
            block
            onPress={() => router.push('/register')}
            style={{ backgroundColor: color.canvas.surface }}
          >
            {t('home.story.cta')}
          </Button>
        )}
        {/* ako:end auth */}
      </View>
    </ScrollView>
  );
}

function CategoryThumb({ category }: { category: ProductCategory }) {
  const { data } = useListProducts({ category, pageSize: 1 });
  return (
    <Image
      source={productImage(data?.items[0])}
      contentFit="cover"
      style={{ width: 64, height: 64, borderRadius: RADIUS.md }}
    />
  );
}
// ako:else sample
//~ import { Paragraph } from '@mari-ui/native/typography';
//~ import { ScrollView, View } from 'react-native';
//~ import { useSafeAreaInsets } from 'react-native-safe-area-context';
//~ import { useT } from '~/features/localization/i18n';
//~ import { Heading } from '~/shared/components/ui';
//~
//~ /** Boş iskelet: kendi ana sayfanızı buraya yazın. */
//~ export default function Home() {
//~   const insets = useSafeAreaInsets();
//~   const t = useT();
//~
//~   return (
//~     <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
//~       <View style={{ paddingTop: insets.top + 28, paddingHorizontal: 20, gap: 16 }}>
//~         <Heading size={38}>{t('home.hero.title')}</Heading>
//~         <Paragraph muted style={{ fontSize: 16, lineHeight: 24 }}>
//~           {t('home.hero.text')}
//~         </Paragraph>
//~       </View>
//~     </ScrollView>
//~   );
//~ }
// ako:end sample
