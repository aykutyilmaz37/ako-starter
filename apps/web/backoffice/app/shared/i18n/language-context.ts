import { createContext } from 'react-router';

/** İsteğin dili (ako_lang çerezinden) ve varsayılan dil; getLoadContext'te (server.ts) doldurulur. */
export interface RequestLanguage {
  lang: string;
  defaultLang: string;
}

export const languageContext = createContext<RequestLanguage>({ lang: 'tr', defaultLang: 'tr' });

/** Dil çerezinin adı. Tarayıcıda dil seçici yazar, sunucu okur. */
export const LANGUAGE_COOKIE = 'ako_lang';
