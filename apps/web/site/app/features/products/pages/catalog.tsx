import { listProducts } from '@ako/api-client/products';
import type { ProductCategory } from '@ako/api-client/model';
import { publicCacheControl, sessionContext } from '@ako/web-core';
import { Empty } from '@mari-ui/components/empty';
import { SearchInput } from '@mari-ui/components/input';
import { Pagination } from '@mari-ui/components/pagination';
import { Text } from '@mari-ui/components/typography';
import { data, useNavigation, useSearchParams } from 'react-router';
import { CategoryFilter } from '~/features/products/components/category-filter';
import { ProductGrid } from '~/features/products/components/product-card';
import { CATEGORIES } from '~/shared/catalog';
import { apiInit } from '~/shared/i18n/api-init.server';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import { SectionHeading } from '~/shared/section-heading';
import type { Route } from './+types/catalog';

// ÖRNEK SAYFA: herkese açık katalog, sunucuda render (SSR) + CDN önbelleği. Projede gerekmiyorsa features/products'ı silin.

const PAGE_SIZE = 12;

function readCategory(value: string | null): ProductCategory | undefined {
  return CATEGORIES.find((c) => c === value);
}

export function meta({ location, matches }: Route.MetaArgs) {
  const t = metaTranslator(matches);
  const category = readCategory(new URLSearchParams(location.search).get('category'));
  const title = category ? t(`category.${category}`) : t('products.all');
  return [
    { title: t('products.meta.title', { title }) },
    { name: 'description', content: t('products.meta.description') },
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
    apiInit(context, request),
  );
  return data(
    { products, category },
    { headers: { 'Cache-Control': publicCacheControl(session) } },
  );
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { 'Cache-Control': loaderHeaders.get('Cache-Control') ?? 'private, no-store' };
}

export default function CatalogPage({ loaderData }: Route.ComponentProps) {
  const { products, category } = loaderData;
  const [params, setParams] = useSearchParams();
  const loading = useNavigation().state === 'loading';
  const t = useT();

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
        eyebrow={t('products.eyebrow')}
        title={category ? t(`category.${category}`) : t('products.all')}
        description={t('products.description')}
      />

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CategoryFilter
          value={category}
          onChange={(c) => setParam({ category: c, page: undefined })}
        />
        <div className="w-full md:max-w-xs">
          <SearchInput
            placeholder={t('products.search.placeholder')}
            defaultValue={params.get('search') ?? ''}
            onSearch={(value) => setParam({ search: value || undefined, page: undefined })}
            aria-label={t('products.search.label')}
          />
        </div>
      </div>

      <Text muted className="mt-6 block text-sm" aria-live="polite">
        {t('products.count', { count: products.totalCount })}
      </Text>

      <div className={`mt-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        {products.items.length === 0 ? (
          <Empty title={t('products.empty.title')} description={t('products.empty.description')} />
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
