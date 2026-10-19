import Storage from 'expo-sqlite/kv-store';

/** Küçük cihaz tercihleri (tema, dil): SQLite tabanlı anahtar-değer deposu. */
export const prefs = {
  get: (key: string): Promise<string | null> => Storage.getItem(key),
  set: (key: string, value: string): Promise<void> => Storage.setItem(key, value),
  remove: (key: string): Promise<void> => Storage.removeItem(key).then(() => undefined),
};
