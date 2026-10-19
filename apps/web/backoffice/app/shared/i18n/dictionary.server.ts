import { getGetDictionaryUrl, getGetLanguagesUrl } from '@ako/api-client/localization'; // ako:lang
import { env } from '~/env.server'; // ako:lang
import type { Dictionary, LanguageInfo } from '~/shared/i18n/i18n';
import type { RequestLanguage } from '~/shared/i18n/language-context';

// Gömülü yedek: app/locales/*.json. API kapalıyken ya da yeni anahtar henüz tabloya yansımadıysa bunlar kullanılır.
const bundled = Object.fromEntries(
  Object.entries(
    import.meta.glob<Dictionary>('/app/locales/*.json', { eager: true, import: 'default' }),
  ).map(([path, dictionary]) => [path.match(/([^/]+)\.json$/)![1]!, dictionary]),
);

const DEFAULT_LANGUAGES: LanguageInfo[] = [
  { code: 'tr', name: 'Türkçe', isDefault: true, isEnabled: true },
];

// ako:begin lang
// Her istekte API'ye gitmemek için bellekte tutulur; süre dolunca ETag ile (If-None-Match) kontrol edilir,
// değişmediyse 304 döner ve yük taşınmaz. Süre dolduğunda eski değer hemen sunulur, yenileme arkada yapılır.
const TTL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 3_000;

interface Entry {
  value: unknown;
  etag: string | null;
  checkedAt: number;
  refresh: Promise<void> | null;
}

const store = new Map<string, Entry>();

async function revalidate(path: string, entry: Entry) {
  try {
    const response = await fetch(env.apiUrl + path, {
      headers: entry.etag ? { 'If-None-Match': entry.etag } : {},
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.ok) {
      entry.value = await response.json();
      entry.etag = response.headers.get('etag');
    }
  } catch {
    // API'ye ulaşılamadı: eldeki değer (yoksa gömülü yedek) kullanılır, bir sonraki süre dolumunda yeniden denenir.
  }
  entry.checkedAt = Date.now();
}

async function cached<T>(path: string): Promise<T | undefined> {
  const entry = store.get(path) ?? { value: undefined, etag: null, checkedAt: 0, refresh: null };
  store.set(path, entry);
  if (Date.now() - entry.checkedAt >= TTL_MS) {
    entry.refresh ??= revalidate(path, entry).finally(() => (entry.refresh = null));
    if (entry.value === undefined) await entry.refresh; // ilk yüklemede beklenir
  }
  return entry.value as T | undefined;
}
// ako:end lang

/** Açık diller; varsayılan dil ilk sırada. */
// ako:begin lang
export async function getLanguages(): Promise<LanguageInfo[]> {
  const languages = await cached<LanguageInfo[]>(getGetLanguagesUrl());
  return languages?.length ? languages : DEFAULT_LANGUAGES;
}
// ako:else lang
//~ export async function getLanguages(): Promise<LanguageInfo[]> {
//~   return DEFAULT_LANGUAGES;
//~ }
// ako:end lang

/** Dilin backoffice sözlüğü: gömülü dosya + tablodaki (admin düzenlemeli) değerler üstüne yazar. */
// ako:begin lang
export async function getDictionary(lang: string, defaultLang: string): Promise<Dictionary> {
  const remote = await cached<Dictionary>(getGetDictionaryUrl(lang, 'backoffice'));
  return { ...bundled[defaultLang], ...bundled[lang], ...remote };
}
// ako:else lang
//~ export async function getDictionary(lang: string, defaultLang: string): Promise<Dictionary> {
//~   return { ...bundled[defaultLang], ...bundled[lang] };
//~ }
// ako:end lang

/** İsteğin dili: çerezdeki dil açıksa o, değilse varsayılan dil. */
export async function resolveRequestLanguage(
  cookieLang: string | undefined,
): Promise<RequestLanguage> {
  const languages = await getLanguages();
  const defaultLang = (languages.find((l) => l.isDefault) ?? languages[0]!).code;
  const lang = languages.find((l) => l.code === cookieLang)?.code;
  return { lang: lang ?? defaultLang, defaultLang };
}
