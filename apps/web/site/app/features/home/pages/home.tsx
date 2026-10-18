import type { ProductCategory } from '@ako/api-client/model';
import { listProducts } from '@ako/api-client/products';
import { CATEGORIES } from '@ako/ui';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import { Button } from '@mari-ui/components/button';
import { data } from 'react-router';
import { ProductGrid } from '../../products/components/product-card';
import { useMe } from '../../../shared/use-me';
import { Benefits } from '../components/benefits';
import { CategoryTiles } from '../components/category-tiles';
import { Hero } from '../components/hero';
import { Story } from '../components/story';
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

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="bu-hafta">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-mari-primary">
              TADIM MASASINDAN
            </p>
            <h2 id="bu-hafta" className="mt-2 font-heading text-3xl font-bold">
              Bu haftanın kahveleri
            </h2>
          </div>
          <Button href="/products?category=Coffee" variant="link" className="shrink-0">
            Tümünü gör
          </Button>
        </div>
        <div className="mt-8">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="kategoriler">
        <h2 id="kategoriler" className="font-heading text-3xl font-bold">
          Ne arıyorsunuz?
        </h2>
        <div className="mt-8">
          <CategoryTiles tiles={tiles} />
        </div>
      </section>

      <div className="mt-24">
        <Story signedIn={!!me} />
      </div>
    </>
  );
}
