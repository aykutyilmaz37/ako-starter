import { getMe } from '@ako/api-client/auth';
import { sessionContext } from '@ako/web-core';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
  useRouteLoaderData,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';
import type { Route } from './+types/root';
import { configureApi } from '~/shared/api';
import { AdminLayout } from '~/shared/admin-layout';
import { apiInit } from '~/shared/i18n/api-init.server';
import { getDictionary, getLanguages } from '~/shared/i18n/dictionary.server';
import { I18nProvider, useT } from '~/shared/i18n/i18n-provider';
import { languageContext } from '~/shared/i18n/language-context';
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
  const { lang, defaultLang } = context.get(languageContext);
  const isLoginPage = new URL(request.url).pathname === '/login';
  const [me, languages, dictionary] = await Promise.all([
    session ? getMe(apiInit(context, request)).catch(() => null) : null,
    getLanguages(),
    getDictionary(lang, defaultLang),
  ]);

  if (!me && !isLoginPage) {
    throw redirect('/login');
  }
  return { me, lang, defaultLang, languages, dictionary };
}

/**
 * Root verisi (oturum, sözlük, diller) sayfa içi gezinmede (arama, sayfalama, menü) yeniden çekilmez;
 * yalnızca bir form gönderiminden (giriş/çıkış gibi) sonra tazelenir.
 */
export function shouldRevalidate({ formMethod }: ShouldRevalidateFunctionArgs) {
  return formMethod !== undefined && formMethod !== 'GET';
}

export function Layout({ children }: { children: React.ReactNode }) {
  const root = useRouteLoaderData<typeof loader>('root');
  const lang = root?.lang ?? 'tr';

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Backoffice arama motorlarında görünmesin. */}
        <meta name="robots" content="noindex, nofollow" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-mari-surface text-mari-foreground antialiased">
        <I18nProvider
          lang={lang}
          defaultLang={root?.defaultLang ?? 'tr'}
          languages={root?.languages ?? []}
          dictionary={root?.dictionary}
        >
          {children}
        </I18nProvider>
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
  const t = useT();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : t('error.generic');
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold">{message}</h1>
    </main>
  );
}
