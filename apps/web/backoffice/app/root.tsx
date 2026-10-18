import { getMe } from '@ako/api-client/auth';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import { AppProviders, configureWebApiClient } from '@ako/ui';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
} from 'react-router';
import type { Route } from './+types/root';
import { AdminLayout } from './shared/admin-layout';
import './app.css';

// Tarayıcıda "/api" (BFF), sunucuda doğrudan API (iç ağdaki, admin endpoint'leri açık örnek).
configureWebApiClient(typeof process !== 'undefined' ? process.env.API_URL : undefined);

/**
 * Backoffice'te giriş sayfası dışındaki her sayfa oturum ister: yoksa /login'e yönlendirilir.
 * Rol kontrolü girişte BFF'te yapılır (requiredRole: "Admin"); API de /admin adreslerinde ayrıca kontrol eder.
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);
  const isLoginPage = new URL(request.url).pathname === '/login';
  const me = session ? await getMe(serverRequestInit(session, request)).catch(() => null) : null;

  if (!me && !isLoginPage) {
    throw redirect('/login');
  }
  return { me };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Backoffice arama motorlarında görünmesin. */}
        <meta name="robots" content="noindex, nofollow" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-mari-surface text-mari-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Beklenmeyen bir hata oluştu.';
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold">{message}</h1>
    </main>
  );
}
