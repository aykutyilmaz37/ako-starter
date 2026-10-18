import { index, route, type RouteConfig } from '@react-router/dev/routes';

// Adres → sayfa eşlemesi. Sayfalar özellik klasörlerinde durur (features/<özellik>/pages).
export default [
  index('features/dashboard/pages/dashboard.tsx'),
  route('products', 'features/products/pages/products.tsx'),
  route('users', 'features/users/pages/users.tsx'),
  route('login', 'features/auth/pages/login.tsx'),
] satisfies RouteConfig;
