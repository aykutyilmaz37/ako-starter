import fallbackDictionary from '~/locales/tr.json';

/** Çeviri anahtarları varsayılan dil dosyasından türer: olmayan anahtar yazılırsa derleme hatası verir. */
export type TranslationKey = keyof typeof fallbackDictionary;
export type Dictionary = Record<string, string>;
export type TranslationValues = Record<string, string | number>;
export type Translate = (key: TranslationKey, values?: TranslationValues) => string;

/** Sözlükte olmayan anahtar anahtarın kendisi olarak görünür; eksik çeviri sayfayı bozmaz. */
export function createTranslator(dictionary: Dictionary): Translate {
  return (key, values) => {
    const text = dictionary[key] ?? key;
    return values
      ? text.replace(/\{(\w+)\}/g, (match, name: string) =>
          name in values ? String(values[name]) : match,
        )
      : text;
  };
}

// BFF adresleri ve dosyalar dile bağlı değildir.
const LANGUAGE_FREE_PREFIXES = ['/api/', '/bff/'];

/**
 * Site adresine dil önekini ekler: varsayılan dil önek almaz ("/products"), diğerleri alır ("/en/products").
 * Dış adresler, BFF adresleri ve önek almaz; göreli yollar olduğu gibi döner.
 */
export function localizePath(path: string, lang: string, defaultLang: string): string {
  if (lang === defaultLang || !path.startsWith('/') || path.startsWith('//')) return path;
  if (LANGUAGE_FREE_PREFIXES.some((prefix) => path.startsWith(prefix))) return path;
  const end = path.search(/[?#]/);
  const pathname = end === -1 ? path : path.slice(0, end);
  const rest = end === -1 ? '' : path.slice(end);
  return `/${lang}${pathname === '/' ? '' : pathname}${rest}`;
}

/** localizePath'in tersi: "/en/products" → "/products". */
export function stripLanguage(pathname: string, lang: string): string {
  if (pathname === `/${lang}`) return '/';
  return pathname.startsWith(`/${lang}/`) ? pathname.slice(lang.length + 1) : pathname;
}

/** Route'un `meta` fonksiyonunda çeviri: sözlük root loader'dan gelir. */
export function metaTranslator(
  matches: ReadonlyArray<{ id: string; loaderData?: unknown } | undefined>,
): Translate {
  const root = matches.find((match) => match?.id === 'root')?.loaderData as
    { dictionary?: Dictionary } | undefined;
  return createTranslator(root?.dictionary ?? fallbackDictionary);
}

export { fallbackDictionary };
