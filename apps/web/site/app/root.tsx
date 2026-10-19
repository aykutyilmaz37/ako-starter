import { getMe } from '@ako/api-client/auth';
import { sessionContext, serverRequestInit } from '@ako/web-core';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';
import { configureApi } from '~/shared/api';
import { AppProviders } from '~/shared/providers';
import { SiteLayout } from '~/shared/site-layout';
import type { Route } from './+types/root';
import appCss from './app.css?url';

// Tarayıcıda "/api" (BFF), sunucuda doğrudan API.
configureApi();

/**
 * CSS <head>'e <link> olarak girer: tarayıcı sayfayı stil yüklenmeden çizmez. (Yan etki importu — import './app.css' —
 * geliştirmede CSS'i JavaScript'ten sonra ekler ve sayfa bir an stilsiz görünüp "titrer".)
 */
export const links: Route.LinksFunction = () => [
  { rel: 'stylesheet', href: appCss },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
];

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
      <SiteLayout>
        <Outlet />
      </SiteLayout>
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto flex min-h-96 max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-mari-primary">
        {notFound ? '404' : 'HATA'}
      </p>
      <h1 className="font-heading text-4xl font-bold">
        {notFound ? 'Aradığınız sayfa bulunamadı' : 'Bir şeyler ters gitti'}
      </h1>
      <p className="text-mari-muted">
        {notFound
          ? 'Sayfa taşınmış ya da hiç var olmamış olabilir.'
          : 'Lütfen biraz sonra tekrar deneyin.'}
      </p>
      <a href="/" className="font-medium text-mari-primary underline-offset-4 hover:underline">
        Ana sayfaya dön
      </a>
    </main>
  );
}
