import { buildSitemap, publicCacheControl, type SitemapEntry } from '@ako/web-core';
import { listProducts } from '@ako/api-client/products'; // ako:sample
import { env } from '~/env.server';
import { getLanguages } from '~/shared/i18n/dictionary.server';
import { localizePath } from '~/shared/i18n/i18n';

// Herkese açık adresler. Projeye özel sayfaları buraya ekleyin; giriş isteyen sayfalar (login, list…) girmez.
// ako:begin sample
const STATIC_PATHS = ['/', '/products'];
// ako:else sample
//~ const STATIC_PATHS = ['/'];
// ako:end sample

// ako:begin sample
const PRODUCT_PAGE_SIZE = 100;

/** Dinamik adresler: ürünler sayfa sayfa çekilir. Başka içerik türleri (yazı, kategori…) için buraya benzerini ekleyin. */
async function productEntries(): Promise<{ path: string; lastModified?: string }[]> {
  const entries: { path: string; lastModified?: string }[] = [];
  for (let page = 1; ; page++) {
    const result = await listProducts({ page, pageSize: PRODUCT_PAGE_SIZE });
    entries.push(
      ...result.items.map((p) => ({ path: `/products/${p.id}`, lastModified: p.updatedAt })),
    );
    if (page >= (result.totalPages ?? 1)) return entries;
  }
}
// ako:end sample

export async function loader() {
  const languages = (await getLanguages()).filter((l) => l.isEnabled);
  const defaultLang = languages.find((l) => l.isDefault)?.code ?? languages[0]?.code ?? 'tr';
  const pages: { path: string; lastModified?: string }[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...(await productEntries()), // ako:sample
  ];

  const url = (path: string, lang: string) => env.publicUrl + localizePath(path, lang, defaultLang);
  // Her dil kendi adresiyle ayrı girdi olur ve hepsi birbirini hreflang ile gösterir.
  const entries: SitemapEntry[] = pages.flatMap(({ path, lastModified }) => {
    const alternates =
      languages.length > 1
        ? [
            ...languages.map((l) => ({ lang: l.code, url: url(path, l.code) })),
            { lang: 'x-default', url: url(path, defaultLang) },
          ]
        : undefined;
    return languages.map((l) => ({ url: url(path, l.code), lastModified, alternates }));
  });

  return new Response(buildSitemap(entries), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Sitemap herkese aynı: CDN 1 saat tutar, sonra eskiyi sunarken yeniler.
      'Cache-Control': publicCacheControl(null, { maxAge: 3600, staleWhileRevalidate: 86400 }),
    },
  });
}
