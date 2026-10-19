import { createContext } from 'react-router';

/** İsteğin dili (adresten) ve varsayılan dil; getLoadContext'te (server.ts) doldurulur. */
export interface RequestLanguage {
  lang: string;
  defaultLang: string;
}

export const languageContext = createContext<RequestLanguage>({ lang: 'tr', defaultLang: 'tr' });
