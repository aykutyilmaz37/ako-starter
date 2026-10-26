import type { Context, Next } from 'hono';
import type { Session } from './session';

/** Sitemap'teki bir adres. `path` dil önekisizdir ("/products"); `alternates` diğer dillerdeki tam adreslerdir. */
export interface SitemapEntry {
  /** Tam adres, ör. "https://site.com/products/1". */
  url: string;
  lastModified?: string;
  alternates?: { lang: string; url: string }[];
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** sitemap.xml gövdesi. Her adres kendi dil karşılıklarıyla (hreflang) birlikte yazılır. */
export function buildSitemap(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const alternates = (entry.alternates ?? [])
      .map(
        (a) =>
          `<xhtml:link rel="alternate" hreflang="${escapeXml(a.lang)}" href="${escapeXml(a.url)}"/>`,
      )
      .join('');
    const lastmod = entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : '';
    return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}${alternates}</url>`;
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    urls.join('') +
    '</urlset>'
  );
}

export interface RobotsOptions {
  /** Sitemap'in tam adresi; verilmezse satır yazılmaz. */
  sitemap?: string;
  /** Taranmaması gereken yollar (ör. ["/login", "/list"]). */
  disallow?: string[];
  /** Hiçbir şeyin taranmasını istemiyorsanız (backoffice). */
  disallowAll?: boolean;
}

/** robots.txt gövdesi. */
export function buildRobots(options: RobotsOptions = {}): string {
  const rules = options.disallowAll ? ['/'] : (options.disallow ?? []);
  const lines = [
    'User-agent: *',
    ...(rules.length ? rules.map((p) => `Disallow: ${p}`) : ['Disallow:']),
  ];
  if (options.sitemap && !options.disallowAll) lines.push('', `Sitemap: ${options.sitemap}`);
  return lines.join('\n') + '\n';
}

/** Hono middleware: tüm yanıtlara `X-Robots-Tag: noindex, nofollow` ekler (backoffice gibi indekslenmemesi gerekenler). */
export async function noIndex(c: Context, next: Next) {
  await next();
  c.res.headers.set('X-Robots-Tag', 'noindex, nofollow');
}

export interface PublicCacheOptions {
  /** CDN'in yanıtı taze sayacağı süre (sn). Varsayılan 60. */
  maxAge?: number;
  /** Süre dolduktan sonra eskiyi sunarken arkada yenileyeceği süre (sn). Varsayılan 300. */
  staleWhileRevalidate?: number;
}

/**
 * Herkese açık sayfa için `Cache-Control`: oturum yoksa sayfa herkes için aynıdır, CDN önbelleğe alır ve
 * süre dolunca eskiyi sunarken arkada yeniler (ISR benzeri). Oturum açıksa başlıkta kullanıcı olduğu için
 * önbelleğe alınmaz.
 */
export function publicCacheControl(
  session: Session | null,
  options: PublicCacheOptions = {},
): string {
  if (session) return 'private, no-store';
  const { maxAge = 60, staleWhileRevalidate = 300 } = options;
  return `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}
