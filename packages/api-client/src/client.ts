import { ApiError, type ProblemDetails } from './errors';

/**
 * Tüm üretilen fonksiyonların (src/generated) geçtiği tek fetch katmanı.
 * Uygulama açılırken bir kez configureApiClient() ile ayarlanır:
 *
 *   web    → baseUrl: "/api"  (Hono BFF; token sunucuda eklenir, tokens verilmez)
 *   mobil  → baseUrl: API adresi, tokens: SecureStore'a yazan bir TokenStore
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Token'ların nerede saklanacağı uygulamaya bırakılır (mobil: SecureStore). */
export interface TokenStore {
  get(): AuthTokens | null | Promise<AuthTokens | null>;
  set(tokens: AuthTokens | null): void | Promise<void>;
}

export interface ApiClientConfig {
  /** Göreli ya da mutlak kök adres, ör. "/api" veya "https://api.site.com". */
  baseUrl: string;
  /** Accept-Language başlığı; API hata mesajlarını bu dilde döner. */
  getLanguage?: () => string | undefined;
  /** Verilirse istekler Bearer token ile yapılır ve 401'de token otomatik yenilenir. */
  tokens?: TokenStore;
  /** Yenileme de başarısız olunca (oturum gerçekten bitti) çağrılır; ör. giriş ekranına yönlendirme. */
  onSessionExpired?: () => void;
  /** Web'de BFF cookie'si için "include"/"same-origin". */
  credentials?: RequestCredentials;
  /** Testler ve özel ortamlar için. */
  fetch?: typeof fetch;
}

let config: ApiClientConfig = { baseUrl: '' };
let refreshing: Promise<boolean> | null = null;

export function configureApiClient(next: ApiClientConfig): void {
  config = { ...next };
  refreshing = null;
}

/** Giriş cevabındaki token'ları saklar (yalnızca tokens ayarlıysa); çıkışta null verilir. */
export async function setAuthTokens(tokens: AuthTokens | null): Promise<void> {
  await config.tokens?.set(
    tokens ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } : null,
  );
}

/** Orval mutator'ı: başarıda gövdeyi döner, hatada ApiError fırlatır. */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response = await send(url, init);

  if (response.status === 401 && config.tokens && !isAuthEndpoint(url) && (await refreshTokens())) {
    response = await send(url, init); // yeni token'la bir kez daha
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readProblem(response));
  }

  return (await readBody(response)) as T;
}

async function send(url: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  const language = config.getLanguage?.();
  if (language) {
    headers.set('Accept-Language', language);
  }

  const tokens = await config.tokens?.get();
  if (tokens) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  return (config.fetch ?? fetch)(config.baseUrl + url, {
    ...init,
    headers,
    credentials: init.credentials ?? config.credentials,
  });
}

/**
 * Refresh token ile yeni token alır. Aynı anda birden fazla istek 401 alırsa tek bir yenileme yapılır,
 * diğerleri onu bekler. Başarısızsa token'lar silinir ve onSessionExpired çağrılır.
 */
function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const current = await config.tokens?.get();
      if (!current) {
        return false;
      }

      const response = await (config.fetch ?? fetch)(`${config.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });

      if (!response.ok) {
        await config.tokens?.set(null);
        config.onSessionExpired?.();
        return false;
      }

      await setAuthTokens((await response.json()) as AuthTokens);
      return true;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

// Giriş ve yenileme isteklerinin kendi 401'i "yanlış şifre / geçersiz token" demektir, yenileme tetiklemez.
function isAuthEndpoint(url: string): boolean {
  return url.startsWith('/auth/login') || url.startsWith('/auth/refresh');
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  return response.headers.get('content-type')?.includes('json') ? JSON.parse(text) : text;
}

async function readProblem(response: Response): Promise<ProblemDetails> {
  try {
    const body = await readBody(response);
    return typeof body === 'object' && body !== null
      ? (body as ProblemDetails)
      : { status: response.status };
  } catch {
    return { status: response.status };
  }
}

export default apiFetch;

// Orval bu iki tipi mutator dosyasından okur: hook'lardaki hata tipi ApiError, gövde tipi olduğu gibi.
export type ErrorType<_Error> = ApiError;
export type BodyType<Body> = Body;
