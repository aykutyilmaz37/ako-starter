import { index, route, type RouteConfig } from '@react-router/dev/routes';

// Adres → sayfa eşlemesi. Sayfalar özellik klasörlerinde durur (features/<özellik>/pages).
export default [
  index('features/home/pages/home.tsx'),
  route('products', 'features/products/pages/catalog.tsx'),
  route('products/:id', 'features/products/pages/product-detail.tsx'),
  route('list', 'features/todos/pages/todos.tsx'),
  route('login', 'features/auth/pages/login.tsx'),
  route('register', 'features/auth/pages/register.tsx'),
  route('verify', 'features/auth/pages/verify.tsx'),
  route('forgot-password', 'features/auth/pages/forgot-password.tsx'),
] satisfies RouteConfig;
