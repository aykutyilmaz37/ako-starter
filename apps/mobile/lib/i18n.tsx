import { getDictionary, getLanguages } from '@ako/api-client/localization';
import { useQuery } from '@tanstack/react-query';
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import de from '~/locales/de.json';
import en from '~/locales/en.json';
import tr from '~/locales/tr.json';
import { setApiLanguage } from '~/lib/api';

/** Çeviri anahtarları varsayılan dil dosyasından türer: olmayan anahtar yazılırsa derleme hatası verir. */
export type TranslationKey = keyof typeof tr;
export type TranslationValues = Record<string, string | number>;
export type Translate = (key: TranslationKey, values?: TranslationValues) => string;

export interface Language {
  code: string;
  name: string;
}

const DEFAULT_LANGUAGE = 'tr';
const KEY = 'ako.lang';

// Uygulamayla gelen metinler: API'ye ulaşılamazken ve ilk açılışta gösterilir. Çevrimiçi sözlük (API'deki
// "mobile" alanı: dosya + backoffice'ten yapılan değişiklikler) bunların üstüne yazar.
const BUNDLED: Record<string, Record<string, string>> = { tr, en, de };
const BUNDLED_LANGUAGES: Language[] = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
];

interface I18n {
  lang: string;
  languages: Language[];
  setLanguage: (code: string) => void;
  t: Translate;
}

const Context = createContext<I18n | null>(null);

function interpolate(text: string, values?: TranslationValues): string {
  return values
    ? text.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in values ? String(values[name]) : match,
      )
    : text;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState(() => {
    const device = getLocales()[0]?.languageCode ?? DEFAULT_LANGUAGE;
    return device in BUNDLED ? device : DEFAULT_LANGUAGE;
  });

  // Kayıtlı tercih cihazın dilini ezer.
  useEffect(() => {
    void SecureStore.getItemAsync(KEY).then((saved) => {
      if (saved && saved in BUNDLED) setLang(saved);
    });
  }, []);

  useEffect(() => setApiLanguage(lang), [lang]);

  // Form doğrulama mesajları (zod) arayüz diliyle: "Geçersiz e-posta adresi" / "Invalid email address".
  const locales = z.locales as Record<string, () => ReturnType<typeof z.locales.en>>;
  z.config((locales[lang] ?? z.locales.en)());

  const languagesQuery = useQuery({
    queryKey: ['localization', 'languages'],
    queryFn: () => getLanguages(),
    staleTime: 5 * 60_000,
  });
  const dictionaryQuery = useQuery({
    queryKey: ['localization', 'mobile', lang],
    queryFn: () => getDictionary(lang, 'mobile'),
    staleTime: 60_000,
  });

  // Yalnızca API'de açık ve uygulamada paketli olan diller seçilebilir.
  const languages = useMemo<Language[]>(() => {
    const enabled = languagesQuery.data?.filter((l) => l.isEnabled && l.code in BUNDLED);
    return enabled?.length ? enabled.map(({ code, name }) => ({ code, name })) : BUNDLED_LANGUAGES;
  }, [languagesQuery.data]);

  const setLanguage = useCallback((code: string) => {
    setLang(code);
    void SecureStore.setItemAsync(KEY, code);
  }, []);

  const value = useMemo<I18n>(() => {
    const remote = dictionaryQuery.data as Record<string, string> | undefined;
    const bundled = BUNDLED[lang] ?? tr;
    const t: Translate = (key, values) =>
      interpolate(remote?.[key] ?? bundled[key] ?? tr[key] ?? key, values);
    return { lang, languages, setLanguage, t };
  }, [lang, languages, setLanguage, dictionaryQuery.data]);

  return <Context value={value}>{children}</Context>;
}

export function useI18n(): I18n {
  const value = useContext(Context);
  if (!value) throw new Error('useI18n I18nProvider içinde kullanılmalı');
  return value;
}

export function useT(): Translate {
  return useI18n().t;
}
