import { isApiError } from '@ako/api-client';
import { getProduct, listProducts } from '@ako/api-client/products';
import { Breadcrumb } from '@mari-ui/components/breadcrumb';
import { Button } from '@mari-ui/components/button';
import { Image } from '@mari-ui/components/image';
import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
import { Tag } from '@mari-ui/components/tag';
import { Paragraph, Text, Title } from '@mari-ui/components/typography';
import { ListPlus, Package, RefreshCw, Truck } from 'lucide-react';
import { data } from 'react-router';
import { ProductGrid } from '~/features/products/components/product-card';
import { useAddToList } from '~/features/products/hooks/use-add-to-list'; // ako:auth
import { formatPrice, productImageSrc, stockState } from '~/shared/catalog';
import { apiInit } from '~/shared/i18n/api-init.server';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useI18n, useLocalePath } from '~/shared/i18n/i18n-provider';
import { SectionHeading } from '~/shared/section-heading';
import { useMe } from '~/shared/use-me'; // ako:auth
import type { Route } from './+types/product-detail';

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const init = apiInit(context, request);
  const product = await getProduct(params.id, init).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) throw data(null, { status: 404 });
    throw error;
  });
  const related = await listProducts({ category: product.category, pageSize: 5 }, init);
  return { product, related: related.items.filter((p) => p.id !== product.id).slice(0, 4) };
}

export function meta({ loaderData, matches }: Route.MetaArgs) {
  const t = metaTranslator(matches);
  if (!loaderData) return [{ title: t('products.detail.notFound') }];
  const { product } = loaderData;
  return [
    { title: t('products.meta.title', { title: product.name }) },
    { name: 'description', content: product.description ?? '' },
    { property: 'og:title', content: product.name },
    { property: 'og:image', content: productImageSrc(product.imageUrl) ?? '' },
  ];
}

export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product, related } = loaderData;
  const { lang, t } = useI18n();
  const localePath = useLocalePath();
  const stock = stockState(product.stock, t);
  const promises = [
    { icon: Truck, text: t('products.detail.promise.shipping') },
    { icon: Package, text: t('products.detail.promise.fast') },
    { icon: RefreshCw, text: t('products.detail.promise.exchange') },
  ];
  const me = useMe(); // ako:auth
  const list = useAddToList(); // ako:auth

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb
        items={[
          { title: t('products.detail.shop'), href: localePath('/products') },
          {
            title: t(`category.${product.category}`),
            href: localePath(`/products?category=${product.category}`),
          },
          { title: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 md:grid-cols-2 lg:gap-16">
        <Image
          src={productImageSrc(product.imageUrl)}
          alt={product.name}
          aspectRatio={1}
          fit="cover"
          priority
          wrapperClassName="overflow-hidden rounded-mari-xl"
        />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Text muted className="text-sm font-semibold uppercase tracking-wider">
              {t(`category.${product.category}`)}
            </Text>
            <Title level={1} className="text-4xl leading-tight">
              {product.name}
            </Title>
            <div className="flex items-center gap-3">
              <Text weight="semibold" className="text-2xl">
                {formatPrice(product.price, lang)}
              </Text>
              <Tag color={stock.color} variant="soft">
                {stock.label}
              </Tag>
            </div>
          </div>

          <Paragraph className="leading-relaxed text-mari-muted">{product.description}</Paragraph>

          {/* ako:begin auth */}
          {me ? (
            <Button
              color="primary"
              size="lg"
              icon={<ListPlus size={20} aria-hidden />}
              loading={list.isPending}
              disabled={!stock.available}
              onClick={() => list.add(product)}
            >
              {stock.available ? t('products.detail.add') : t('products.detail.unavailable')}
            </Button>
          ) : (
            <Button
              color="primary"
              size="lg"
              href={localePath('/login')}
              icon={<ListPlus size={20} aria-hidden />}
            >
              {t('products.detail.loginToAdd')}
            </Button>
          )}
          {/* ako:end auth */}

          <List
            size="sm"
            split={false}
            aria-label={t('products.detail.promisesLabel')}
            className="border-t border-mari-border pt-4"
            dataSource={promises}
            rowKey="text"
            renderItem={({ icon: Icon, text }) => (
              <ListItem>
                <ListItemMeta
                  avatar={<Icon size={18} className="text-mari-primary" aria-hidden />}
                  title={text}
                />
              </ListItem>
            )}
          />
          <Text muted className="text-xs">
            {t('products.detail.sku', { sku: product.sku })}
          </Text>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 flex flex-col gap-6" aria-labelledby="benzer">
          <SectionHeading id="benzer" title={t('products.detail.related')} />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
