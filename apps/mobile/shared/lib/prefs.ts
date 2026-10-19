import * as SecureStore from 'expo-secure-store';

/** Küçük cihaz tercihleri (tema, dil). Backend'siz sürümde bu dosya `expo-sqlite/kv-store` ile değişir. */
export const prefs = {
  get: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  set: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  remove: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
