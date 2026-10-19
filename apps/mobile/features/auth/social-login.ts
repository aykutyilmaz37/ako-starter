import { isApiError } from '@ako/api-client';
import { exchangeLoginCode, nativeLogin } from '@ako/api-client/auth';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { API_URL } from '~/shared/lib/config';
import type { TranslationKey } from '~/features/localization/i18n';
import { useSession } from '~/features/auth/session';

// Tarayıcı oturumu uygulamaya dönerken (Android) bekleyen sonucu tamamlar.
WebBrowser.maybeCompleteAuthSession();

export const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
  github: 'GitHub',
  x: 'X',
  linkedin: 'LinkedIn',
};

/** API'nin döndüğü hata kodlarının çeviri anahtarı (web'deki AUTH_ERROR_KEYS ile aynı kodlar). */
const ERROR_KEYS: Record<string, TranslationKey> = {
  'auth.email_in_use': 'auth.error.email_in_use',
  'auth.external_failed': 'auth.error.external_failed',
  'auth.provider_unavailable': 'auth.error.provider_unavailable',
};

function errorKey(error: unknown): TranslationKey {
  const code = isApiError(error) ? error.code : undefined;
  return (code && ERROR_KEYS[code]) || 'auth.error.external_failed';
}

/**
 * Sosyal giriş. İki yol, ikisi de aynı hesaba çıkar:
 *  - `browser`: tüm sağlayıcılar. API'nin OAuth akışı sistem tarayıcısında açılır, bitince ako:// ile
 *    tek kullanımlık kod döner, kod /auth/exchange ile token'a çevrilir.
 *  - `native`: Apple ve Google'da cihazdaki hesap seçiciyle alınan id token /auth/native/{provider}'a gider.
 */
export function useSocialLogin() {
  const { signIn } = useSession();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<TranslationKey | null>(null);

  async function run(provider: string, flow: () => Promise<void>) {
    setPending(provider);
    setError(null);
    try {
      await flow();
    } catch (e) {
      // Kullanıcı vazgeçtiyse (iptal) hata gösterilmez.
      if (!(e instanceof CancelledError)) setError(errorKey(e));
    } finally {
      setPending(null);
    }
  }

  async function browserFlow(provider: string) {
    // Expo Go'da exp://…/--/auth/callback, derlenmiş uygulamada ako://auth/callback.
    const returnUrl = Linking.createURL('auth/callback');
    const start = `${API_URL}/auth/external/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`;
    const result = await WebBrowser.openAuthSessionAsync(start, returnUrl);
    if (result.type !== 'success') throw new CancelledError();

    const { queryParams } = Linking.parse(result.url);
    const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
    if (!code) {
      const apiError = typeof queryParams?.error === 'string' ? queryParams.error : '';
      throw Object.assign(new Error(apiError), { code: apiError });
    }
    await signIn(await exchangeLoginCode({ code }));
  }

  const browser = (provider: string) => run(provider, () => browserFlow(provider));

  /** Yerel giriş; SDK yoksa (Expo Go) ya da başarısızsa tarayıcı akışına düşer, kullanıcı vazgeçtiyse durur. */
  const native = (provider: 'apple' | 'google') =>
    run(provider, async () => {
      try {
        const idToken = provider === 'apple' ? await appleIdToken() : await googleIdToken();
        await signIn(await nativeLogin(provider, { idToken }));
      } catch (e) {
        if (e instanceof CancelledError) throw e;
        await browserFlow(provider);
      }
    });

  return { pending, error, browser, native };
}

class CancelledError extends Error {}

async function appleIdToken(): Promise<string> {
  const Apple = await import('expo-apple-authentication');
  try {
    const credential = await Apple.signInAsync({
      requestedScopes: [Apple.AppleAuthenticationScope.EMAIL],
    });
    if (!credential.identityToken) throw new Error('no identity token');
    return credential.identityToken;
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') throw new CancelledError();
    throw e;
  }
}

/**
 * Google yerel SDK'sı Expo Go'da yoktur (geliştirme derlemesi gerekir; bkz. README). Modül yoksa ya da
 * istemci kimliği tanımlı değilse sağlayıcı "kullanılamıyor" sayılır ve tarayıcı akışı kalır.
 */
async function googleIdToken(): Promise<string> {
  const { GoogleSignin, isCancelledResponse } =
    await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (isCancelledResponse(response)) throw new CancelledError();
  if (!response.data?.idToken) throw new Error('no id token');
  return response.data.idToken;
}

/** Bu cihazda yerel girişin gösterilmesi gereken sağlayıcılar (API'de açık + cihaz destekliyor). */
export function nativeSupported(provider: string): boolean {
  return provider === 'google' || provider === 'apple';
}
