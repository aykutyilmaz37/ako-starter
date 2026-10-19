import { getMe } from '@ako/api-client/auth'; // ako:auth
import { sessionContext } from '@ako/web-core'; // ako:auth
import { themeInitScript } from '@ako/web-core/theme';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useRouteLoaderData,
} from 'react-router';
import { env } from '~/env.server';
import { configureApi } from '~/shared/api';
import { getDictionary, getLanguages } from '~/shared/i18n/dictionary.server';
import { apiInit } from '~/shared/i18n/api-init.server'; // ako:auth
import { stripLanguage, localizePath } from '~/shared/i18n/i18n';
import { I18nProvider, LocaleLink, useT } from '~/shared/i18n/i18n-provider';
import { languageContext } from '~/shared/i18n/language-context';
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

/**
 * Oturum açıksa kullanıcı bilgisi sunucuda alınır; sayfa ilk açılışta doğru başlıkla gelir (bkz. shared/use-me).
 * Aynı yerde sayfanın dili ve sözlüğü de gelir (sözlük sunucuda kısa süre önbelleklenir, bkz. dictionary.server).
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const { lang, defaultLang } = context.get(languageContext);
  // ako:begin auth
  const session = context.get(sessionContext);
  const [me, languages, dictionary] = await Promise.all([
    session ? getMe(apiInit(context, request)).catch(() => null) : null,
    getLanguages(),
    getDictionary(lang, defaultLang),
  ]);
  return { me, lang, defaultLang, languages, dictionary, origin: env.publicUrl };
  // ako:else auth
  //~ const [languages, dictionary] = await Promise.all([
  //~   getLanguages(),
  //~   getDictionary(lang, defaultLang),
  //~ ]);
  //~ return { lang, defaultLang, languages, dictionary, origin: env.publicUrl };
  // ako:end auth
}

export function Layout({ children }: { children: React.ReactNode }) {
  const root = useRouteLoaderData<typeof loader>('root');
  const location = useLocation();
  const lang = root?.lang ?? 'tr';
  const defaultLang = root?.defaultLang ?? 'tr';
  const languages = root?.languages ?? [];

  // Aynı sayfanın diğer dillerdeki karşılıkları (arama motorları için).
  const path = stripLanguage(location.pathname, lang) + location.search;
  const alternates = languages.length > 1 && root ? languages : [];

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {alternates.map((l) => (
          <link
            key={l.code}
            rel="alternate"
            hrefLang={l.code}
            href={root!.origin + localizePath(path, l.code, defaultLang)}
          />
        ))}
        {alternates.length > 0 && (
          <link
            rel="alternate"
            hrefLang="x-default"
            href={root!.origin + localizePath(path, defaultLang, defaultLang)}
          />
        )}
      </head>
      <body className="min-h-screen bg-mari-surface text-mari-foreground antialiased">
        <I18nProvider
          lang={lang}
          defaultLang={defaultLang}
          languages={languages}
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
      <SiteLayout>
        <Outlet />
      </SiteLayout>
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const t = useT();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto flex min-h-96 max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-mari-primary">
        {notFound ? t('error.notFound.code') : t('error.generic.code')}
      </p>
      <h1 className="font-heading text-4xl font-bold">
        {notFound ? t('error.notFound.title') : t('error.generic.title')}
      </h1>
      <p className="text-mari-muted">
        {notFound ? t('error.notFound.text') : t('error.generic.text')}
      </p>
      <LocaleLink
        to="/"
        reloadDocument
        className="font-medium text-mari-primary underline-offset-4 hover:underline"
      >
        {t('error.home')}
      </LocaleLink>
    </main>
  );
}
