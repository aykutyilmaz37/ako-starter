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
} from 'react-router';
import type { Route } from './+types/root';
import { SiteLayout } from './shared/site-layout';
import './app.css';

// Tarayıcıda "/api" (BFF), sunucuda doğrudan API.
configureWebApiClient(typeof process !== 'undefined' ? process.env.API_URL : undefined);

/** Oturum açıksa kullanıcı bilgisi sunucuda alınır; sayfa ilk açılışta doğru başlıkla gelir (bkz. shared/use-me). */
export async function loader({ request, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);
  const me = session ? await getMe(serverRequestInit(session, request)).catch(() => null) : null;
  return { me };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-mari-bg text-mari-fg">
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
      <SiteLayout>
        <Outlet />
      </SiteLayout>
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
