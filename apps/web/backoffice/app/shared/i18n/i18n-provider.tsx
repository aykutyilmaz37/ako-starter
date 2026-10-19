import type { LanguageResponse } from '@ako/api-client/model';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { z } from 'zod';
import {
  createTranslator,
  fallbackDictionary,
  type Dictionary,
  type Translate,
} from '~/shared/i18n/i18n';

interface I18nValue {
  lang: string;
  defaultLang: string;
  languages: LanguageResponse[];
  t: Translate;
}

const I18nContext = createContext<I18nValue | null>(null);

interface I18nProviderProps {
  lang: string;
  defaultLang: string;
  languages: LanguageResponse[];
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
