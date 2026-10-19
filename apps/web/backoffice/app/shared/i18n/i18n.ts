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

/** Route'un `meta` fonksiyonunda çeviri: sözlük root loader'dan gelir. */
export function metaTranslator(
  matches: ReadonlyArray<{ id: string; loaderData?: unknown } | undefined>,
): Translate {
  const root = matches.find((match) => match?.id === 'root')?.loaderData as
    { dictionary?: Dictionary } | undefined;
  return createTranslator(root?.dictionary ?? fallbackDictionary);
}

export { fallbackDictionary };
