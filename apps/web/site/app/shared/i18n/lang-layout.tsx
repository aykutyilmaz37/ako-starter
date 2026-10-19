import { Outlet, data, redirect } from 'react-router';
import { stripLanguage } from '~/shared/i18n/i18n';
import { languageContext } from '~/shared/i18n/language-context';
import type { Route } from './+types/lang-layout';

// Tüm sayfaların üstündeki isteğe bağlı ":lang" segmenti (routes.ts). Varsayılan dilde adres önek almaz.

export function loader({ params, request, context }: Route.LoaderArgs) {
  const { lang, defaultLang } = context.get(languageContext);
  if (params.lang === undefined) return null;

  // "/tr/products" tek adres olsun diye öneksiz olana yönlendirilir.
  if (params.lang === defaultLang) {
    const url = new URL(request.url);
    throw redirect(stripLanguage(url.pathname, defaultLang) + url.search, 301);
  }
  // Bilinmeyen ya da kapalı dil.
  if (params.lang !== lang) throw data(null, { status: 404 });
  return null;
}

export default function LangLayout() {
  return <Outlet />;
}
