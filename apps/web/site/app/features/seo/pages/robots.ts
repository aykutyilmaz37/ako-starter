import { buildRobots } from '@ako/web-core';
import { env } from '~/env.server';

// Giriş gerektiren ya da arama sonucunda değeri olmayan sayfalar taranmaz. Dil önekli karşılıkları (/en/login) için
// robots.txt joker destekler: "/*/login".
// ako:begin auth
const DISALLOW = [
  '/api/',
  '/bff/',
  '/login',
  '/register',
  '/verify',
  '/forgot-password',
  '/list',
  '/*/login',
  '/*/register',
  '/*/verify',
  '/*/forgot-password',
  '/*/list',
];
// ako:else auth
//~ const DISALLOW = ['/api/', '/bff/'];
// ako:end auth

export function loader() {
  return new Response(
    buildRobots({ sitemap: `${env.publicUrl}/sitemap.xml`, disallow: DISALLOW }),
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
}
