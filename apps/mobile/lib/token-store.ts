import * as SecureStore from 'expo-secure-store';
import type { AuthTokens, TokenStore } from '@ako/api-client';

const KEY = 'ako.tokens';

/** Access ve refresh token cihazın güvenli deposunda (Keychain / Keystore) tutulur. */
export const tokenStore: TokenStore = {
  async get() {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  },
  async set(tokens) {
    if (tokens) {
      await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  },
};
