import type { ProductCategory } from '@ako/api-client/model';
import { listProducts } from '@ako/api-client/products';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import { Button } from '@mari-ui/components/button';
import { data } from 'react-router';
import { Benefits } from '~/features/home/components/benefits';
import { CategoryTiles } from '~/features/home/components/category-tiles';
import { Hero } from '~/features/home/components/hero';
import { Story } from '~/features/home/components/story';
import { ProductGrid } from '~/features/products/components/product-card';
import { CATEGORIES } from '~/shared/catalog';
import { SectionHeading } from '~/shared/section-heading';
import { useMe } from '~/shared/use-me';
import type { Route } from './+types/home';

export function meta() {
  return [
    { title: 'Akı Kahve · Taze kavrulmuş nitelikli kahve' },
    {
      name: 'description',
      content: 'Tek menşeli kahveler, haftada iki kez kavrulur. Demleme ekipmanı ve aksesuarlar.',
    },
  ];
}

/** Öne çıkan kahveler + her kategorinin ürün sayısı ve ilk görseli; hepsi paralel, sunucuda. */
export async function loader({ request, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);
  const init = serverRequestInit(session, request);
  const [featured, ...perCategory] = await Promise.all([
    listProducts({ category: 'Coffee', pageSize: 4 }, init),
    ...CATEGORIES.map((category) => listProducts({ category, pageSize: 1 }, init)),
  ]);
  const tiles = CATEGORIES.map((category: ProductCategory, i) => ({
    category,
    count: perCategory[i]!.totalCount,
    imageUrl: perCategory[i]!.items[0]?.imageUrl ?? null,
  }));
  const cacheControl = session
    ? 'private, no-store'
    : 'public, s-maxage=60, stale-while-revalidate=300';
  return data({ featured: featured.items, tiles }, { headers: { 'Cache-Control': cacheControl } });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { 'Cache-Control': loaderHeaders.get('Cache-Control') ?? 'private, no-store' };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { featured, tiles } = loaderData;
  const me = useMe();

  return (
    <>
      <Hero images={featured.map((p) => p.imageUrl)} />
      <Benefits />

      <section
        className="mx-auto mt-20 flex max-w-6xl flex-col gap-8 px-4 sm:px-6"
        aria-labelledby="bu-hafta"
      >
        <div className="flex items-end justify-between gap-4">
          <SectionHeading id="bu-hafta" eyebrow="TADIM MASASINDAN" title="Bu haftanın kahveleri" />
          <Button href="/products?category=Coffee" variant="link" className="shrink-0">
            Tümünü gör
          </Button>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section
        className="mx-auto mt-20 flex max-w-6xl flex-col gap-8 px-4 sm:px-6"
        aria-labelledby="kategoriler"
      >
        <SectionHeading id="kategoriler" title="Ne arıyorsunuz?" />
        <CategoryTiles tiles={tiles} />
      </section>

      <div className="mt-24">
        <Story signedIn={!!me} />
      </div>
    </>
  );
}
