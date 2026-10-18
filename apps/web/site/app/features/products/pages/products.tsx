import { listProducts } from '@ako/api-client/products';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import { Title } from '@mari-ui/components/typography';
import { data, useNavigation, useSearchParams } from 'react-router';
import { ProductSearch } from '../components/product-search';
import { ProductsTable } from '../components/products-table';
import type { Route } from './+types/products';

// ÖRNEK SAYFA: herkese açık liste, sunucuda render (SSR) + CDN önbelleği. Projede gerekmiyorsa features/products'ı silin.

const PAGE_SIZE = 10;

export function meta() {
  return [{ title: 'Ürünler | Ako' }];
}

/**
 * Giriş yapılmamışsa sayfa herkes için aynıdır: CDN 60 sn önbelleğe alır, sonraki 5 dk eskisini sunarken
 * arkada yeniler. Oturum açıksa (başlıkta kullanıcı adı var) önbelleğe alınmaz.
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const search = url.searchParams.get('search') ?? undefined;
  const session = context.get(sessionContext);
  const products = await listProducts(
    { page, pageSize: PAGE_SIZE, search },
    serverRequestInit(session, request),
  );
  const cacheControl = session
    ? 'private, no-store'
    : 'public, s-maxage=60, stale-while-revalidate=300';
  return data({ products }, { headers: { 'Cache-Control': cacheControl } });
}

export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { 'Cache-Control': loaderHeaders.get('Cache-Control') ?? 'private, no-store' };
}

export default function ProductsPage({ loaderData }: Route.ComponentProps) {
  const [params, setParams] = useSearchParams();
  const loading = useNavigation().state === 'loading';

  // Arama ve sayfa URL'de durur: paylaşılabilir, geri tuşu çalışır, loader sunucuda tekrar çalışır.
  const setParam = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { preventScrollReset: true });
  };

  return (
    <section className="flex flex-col gap-6">
      <Title level={2}>Ürünler</Title>
      <ProductSearch
        defaultValue={params.get('search') ?? ''}
        onSearch={(search) => setParam({ search: search || undefined, page: undefined })}
      />
      <ProductsTable
        products={loaderData.products}
        loading={loading}
        onPageChange={(page) => setParam({ page: String(page) })}
      />
    </section>
  );
}
