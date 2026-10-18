import { getProduct, listProducts } from '@ako/api-client/products';
import { isApiError } from '@ako/api-client';
import { CATEGORY_LABELS, formatPrice, productImageSrc, stockState } from '@ako/ui';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import { Breadcrumb } from '@mari-ui/components/breadcrumb';
import { Button } from '@mari-ui/components/button';
import { Tag } from '@mari-ui/components/tag';
import { ListPlus, Package, RefreshCw, Truck } from 'lucide-react';
import { data } from 'react-router';
import { useMe } from '../../../shared/use-me';
import { ProductGrid } from '../components/product-card';
import { useAddToList } from '../hooks/use-add-to-list';
import type { Route } from './+types/product-detail';

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const init = serverRequestInit(context.get(sessionContext), request);
  const product = await getProduct(params.id, init).catch((error: unknown) => {
    if (isApiError(error) && error.status === 404) throw data(null, { status: 404 });
    throw error;
  });
  const related = await listProducts({ category: product.category, pageSize: 5 }, init);
  return { product, related: related.items.filter((p) => p.id !== product.id).slice(0, 4) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: 'Ürün bulunamadı | Akı Kahve' }];
  const { product } = loaderData;
  return [
    { title: `${product.name} | Akı Kahve` },
    { name: 'description', content: product.description ?? '' },
    { property: 'og:title', content: product.name },
    { property: 'og:image', content: productImageSrc(product.imageUrl) ?? '' },
  ];
}

const promises = [
  { icon: Truck, text: '750 ₺ üzeri siparişlerde ücretsiz kargo' },
  { icon: Package, text: 'Kavrulduktan sonra 48 saat içinde kargoda' },
  { icon: RefreshCw, text: 'Beğenmezseniz 14 gün içinde değişim' },
];

export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product, related } = loaderData;
  const stock = stockState(product.stock);
  const me = useMe();
  const list = useAddToList();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb
        items={[
          { title: 'Mağaza', href: '/products' },
          {
            title: CATEGORY_LABELS[product.category],
            href: `/products?category=${product.category}`,
          },
          { title: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-mari-xl bg-mari-surface-alt">
          <img
            src={productImageSrc(product.imageUrl)}
            alt={product.name}
            width={800}
            height={800}
            className="aspect-square size-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-mari-muted">
              {CATEGORY_LABELS[product.category]}
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
              <Tag color={stock.color} variant="soft">
                {stock.label}
              </Tag>
            </div>
          </div>

          <p className="leading-relaxed text-mari-muted">{product.description}</p>

          {me ? (
            <Button
              color="primary"
              size="lg"
              icon={<ListPlus size={20} aria-hidden />}
              loading={list.isPending}
              disabled={!stock.available}
              onClick={() => list.add(product)}
            >
              {stock.available ? 'Alışveriş listeme ekle' : 'Şu an stokta yok'}
            </Button>
          ) : (
            <Button
              color="primary"
              size="lg"
              href="/login"
              icon={<ListPlus size={20} aria-hidden />}
            >
              Listeye eklemek için giriş yapın
            </Button>
          )}

          <ul className="flex flex-col gap-3 border-t border-mari-border pt-6 text-sm">
            {promises.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Icon size={18} className="shrink-0 text-mari-primary" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
          <p className="text-xs text-mari-muted">SKU: {product.sku}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="benzer">
          <h2 id="benzer" className="font-heading text-2xl font-bold">
            Bunları da sevebilirsiniz
          </h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
