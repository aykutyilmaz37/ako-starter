import { getMe } from '@ako/api-client/auth';
import { sessionContext, serverRequestInit } from '@ako/web-core';
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
import { configureApi } from '~/shared/api';
import { AdminLayout } from '~/shared/admin-layout';
import { AppProviders } from '~/shared/providers';
import appCss from './app.css?url';

// Tarayıcıda "/api" (BFF), sunucuda doğrudan API (iç ağdaki, admin endpoint'leri açık örnek).
configureApi();

/** CSS <head>'e <link> olarak girer: sayfa stil yüklenmeden çizilmez (yan etki importu titremeye yol açıyordu). */
export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: appCss },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
];

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
