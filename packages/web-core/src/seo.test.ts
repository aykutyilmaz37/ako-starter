import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { buildRobots, buildSitemap, noIndex, publicCacheControl } from './seo';

describe('SEO', () => {
  it('sitemap adresleri ve dil karşılıklarını yazar, özel karakterleri kaçırır', () => {
    const xml = buildSitemap([
      {
        url: 'https://site.com/products?a=1&b=2',
        lastModified: '2026-10-01',
        alternates: [{ lang: 'en', url: 'https://site.com/en/products' }],
      },
    ]);
    expect(xml).toContain('<loc>https://site.com/products?a=1&amp;b=2</loc>');
    expect(xml).toContain('<lastmod>2026-10-01</lastmod>');
    expect(xml).toContain('hreflang="en" href="https://site.com/en/products"');
  });

  it('robots.txt: sitemap ve yasaklar', () => {
    expect(buildRobots({ sitemap: 'https://site.com/sitemap.xml', disallow: ['/login'] })).toBe(
      'User-agent: *\nDisallow: /login\n\nSitemap: https://site.com/sitemap.xml\n',
    );
    expect(buildRobots()).toBe('User-agent: *\nDisallow:\n');
    expect(buildRobots({ disallowAll: true, sitemap: 'https://x/sitemap.xml' })).toBe(
      'User-agent: *\nDisallow: /\n',
    );
  });

  it('noIndex her yanıta X-Robots-Tag ekler', async () => {
    const app = new Hono();
    app.use('*', noIndex);
    app.get('/', (c) => c.text('ok'));
    const response = await app.request('/');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('oturum yoksa CDN önbelleği, varsa önbellek yok', () => {
    expect(publicCacheControl(null)).toBe('public, s-maxage=60, stale-while-revalidate=300');
    expect(publicCacheControl(null, { maxAge: 600, staleWhileRevalidate: 3600 })).toBe(
      'public, s-maxage=600, stale-while-revalidate=3600',
    );
    expect(publicCacheControl({ accessToken: 'a', refreshToken: 'r', expiresAt: 1 })).toBe(
      'private, no-store',
    );
  });
});
