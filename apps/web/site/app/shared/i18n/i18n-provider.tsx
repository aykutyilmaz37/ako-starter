import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { z } from 'zod';
import {
  createTranslator,
  fallbackDictionary,
  localizePath,
  type Dictionary,
  type LanguageInfo,
  type Translate,
} from '~/shared/i18n/i18n';

interface I18nValue {
  lang: string;
  defaultLang: string;
  languages: LanguageInfo[];
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

interface I18nProviderProps {
  lang: string;
  defaultLang: string;
  languages: LanguageInfo[];
  dictionary: Dictionary | undefined;
  children: ReactNode;
}

/** Sözlük root loader'da gelir; sağlayıcı root Layout'tadır ki hata sayfası da çevrilmiş çıksın. */
export function I18nProvider({
  lang,
  defaultLang,
  languages,
  dictionary,
  children,
}: I18nProviderProps) {
  const value = useMemo(
    () => ({
      lang,
      defaultLang,
      languages,
      t: createTranslator(dictionary ?? fallbackDictionary),
    }),
    [lang, defaultLang, languages, dictionary],
  );

  // Form doğrulama mesajları arayüz diliyle (zod'da karşılığı yoksa İngilizce).
  const locales = z.locales as Record<string, () => ReturnType<typeof z.locales.en>>;
  z.config((locales[lang] ?? z.locales.en)());

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n, I18nProvider dışında kullanılamaz.');
  return value;
}

/** Çeviri fonksiyonu: t('home.hero.title'), t('products.count', { count: 3 }). */
export function useT(): Translate {
  return useI18n().t;
}

/** Yerelleştirilmiş adres: lp('/products') → varsayılan dilde "/products", İngilizcede "/en/products". */
export function useLocalePath(): (path: string) => string {
  const { lang, defaultLang } = useI18n();
  return (path) => localizePath(path, lang, defaultLang);
}

/** react-router Link'inin dil öneki ekleyen hâli. mari-ui bileşenlerinin `href`'i için useLocalePath kullanılır. */
export function LocaleLink({ to, ...props }: Omit<LinkProps, 'to'> & { to: string }) {
  const localePath = useLocalePath();
  return <Link to={localePath(to)} {...props} />;
}
