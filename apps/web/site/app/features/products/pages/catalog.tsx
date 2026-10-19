import { listProducts } from '@ako/api-client/products';
import type { ProductCategory } from '@ako/api-client/model';
import { CATEGORIES, CATEGORY_LABELS } from '~/shared/catalog';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import { Empty } from '@mari-ui/components/empty';
import { SearchInput } from '@mari-ui/components/input';
import { Pagination } from '@mari-ui/components/pagination';
import { Text } from '@mari-ui/components/typography';
import { data, useNavigation, useSearchParams } from 'react-router';
import { CategoryFilter } from '~/features/products/components/category-filter';
import { ProductGrid } from '~/features/products/components/product-card';
import { SectionHeading } from '~/shared/section-heading';
import type { Route } from './+types/catalog';

// ÖRNEK SAYFA: herkese açık katalog, sunucuda render (SSR) + CDN önbelleği. Projede gerekmiyorsa features/products'ı silin.

const PAGE_SIZE = 12;

function readCategory(value: string | null): ProductCategory | undefined {
  return CATEGORIES.find((c) => c === value);
}

export function meta({ location }: Route.MetaArgs) {
  const category = readCategory(new URLSearchParams(location.search).get('category'));
  const title = category ? CATEGORY_LABELS[category] : 'Tüm ürünler';
  return [
    { title: `${title} | Akı Kahve` },
    { name: 'description', content: 'Taze kavrulmuş nitelikli kahveler ve demleme ekipmanı.' },
  ];
}

/**
 * Giriş yapılmamışsa sayfa herkes için aynıdır: CDN 60 sn önbelleğe alır, sonraki 5 dk eskisini sunarken
 * arkada yeniler. Oturum açıksa (başlıkta kullanıcı adı var) önbelleğe alınmaz.
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const search = url.searchParams.get('search') ?? undefined;
  const category = readCategory(url.searchParams.get('category'));
  const session = context.get(sessionContext);
  const products = await listProducts(
    { page, pageSize: PAGE_SIZE, search, category },
    serverRequestInit(session, request),
  );
  const cacheControl = session
    ? 'private, no-store'
    : 'public, s-maxage=60, stale-while-revalidate=300';
  return data({ products, category }, { headers: { 'Cache-Control': cacheControl } });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { 'Cache-Control': loaderHeaders.get('Cache-Control') ?? 'private, no-store' };
}

export default function CatalogPage({ loaderData }: Route.ComponentProps) {
  const { products, category } = loaderData;
  const [params, setParams] = useSearchParams();
  const loading = useNavigation().state === 'loading';

  // Süzgeçler URL'de durur: paylaşılabilir, geri tuşu çalışır, loader sunucuda yeniden çalışır.
  const setParam = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { preventScrollReset: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        level={1}
        eyebrow="MAĞAZA"
        title={category ? CATEGORY_LABELS[category] : 'Tüm ürünler'}
        description="Her paket siparişinizden önceki hafta kavrulur. Beğendiklerinizi alışveriş listenize ekleyip daha sonra kolayca bulabilirsiniz."
      />

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CategoryFilter
          value={category}
          onChange={(c) => setParam({ category: c, page: undefined })}
        />
        <div className="w-full md:max-w-xs">
          <SearchInput
            placeholder="Ürün ya da menşe ara"
            defaultValue={params.get('search') ?? ''}
            onSearch={(value) => setParam({ search: value || undefined, page: undefined })}
            aria-label="Ürünlerde ara"
          />
        </div>
      </div>

      <Text muted className="mt-6 block text-sm" aria-live="polite">
        {products.totalCount} ürün
      </Text>

      <div className={`mt-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        {products.items.length === 0 ? (
          <Empty title="Ürün bulunamadı" description="Farklı bir arama ya da kategori deneyin." />
        ) : (
          <ProductGrid products={products.items} />
        )}
      </div>

      {products.totalCount > products.pageSize && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={products.page}
            pageSize={products.pageSize}
            totalItems={products.totalCount}
            onPageChange={(page) => setParam({ page: String(page) })}
          />
        </div>
      )}
    </div>
  );
}
