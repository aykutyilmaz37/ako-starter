import { index, route, type RouteConfig } from '@react-router/dev/routes';

// Adres → sayfa eşlemesi. Sayfalar özellik klasörlerinde durur (features/<özellik>/pages).
export default [
  // Backoffice indekslenmez (ayrıca tüm yanıtlara X-Robots-Tag: noindex eklenir, bkz. server.ts).
  route('robots.txt', 'features/seo/pages/robots.ts'),
  index('features/dashboard/pages/dashboard.tsx'),
  route('products', 'features/products/pages/products.tsx'), // ako:sample
  route('users', 'features/users/pages/users.tsx'),
  route('translations', 'features/localization/pages/translations.tsx'), // ako:lang
  route('login', 'features/auth/pages/login.tsx'),
] satisfies RouteConfig;
