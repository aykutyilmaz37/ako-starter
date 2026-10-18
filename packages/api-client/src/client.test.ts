import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, configureApiClient, type AuthTokens, type TokenStore } from './client';
import { ApiError, applyFieldErrors } from './errors';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function memoryTokens(initial: AuthTokens | null): TokenStore & { current: AuthTokens | null } {
  const store = {
    current: initial,
    get: () => store.current,
    set: (t: AuthTokens | null) => {
      store.current = t;
    },
  };
  return store;
}

describe('apiFetch', () => {
  beforeEach(() => configureApiClient({ baseUrl: '' }));

  it('adres, dil ve token başlıklarını ekler; JSON gövdeyi döner', async () => {
    const fetch = vi.fn(async () => json(200, { id: 1 }));
    configureApiClient({
      baseUrl: 'https://api.test',
      getLanguage: () => 'en',
      tokens: memoryTokens({ accessToken: 'A', refreshToken: 'R' }),
      fetch,
    });

    await expect(apiFetch('/products')).resolves.toEqual({ id: 1 });

    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe('https://api.test/products');
    expect(headers.get('Accept-Language')).toBe('en');
    expect(headers.get('Authorization')).toBe('Bearer A');
  });

  it('204 için undefined döner', async () => {
    configureApiClient({ baseUrl: '', fetch: async () => new Response(null, { status: 204 }) });
    await expect(apiFetch('/products/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('ProblemDetails cevabını ApiError olarak fırlatır', async () => {
    configureApiClient({
      baseUrl: '',
      fetch: async () => json(409, { status: 409, detail: 'SKU dolu', code: 'products.sku_taken' }),
    });

    const error = await apiFetch('/products').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: 'products.sku_taken', message: 'SKU dolu' });
  });

  it('401de token yeniler ve isteği tekrarlar; eşzamanlı isteklerde tek yenileme yapar', async () => {
    const tokens = memoryTokens({ accessToken: 'eski', refreshToken: 'R1' });
    let refreshCalls = 0;
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/auth/refresh') {
        refreshCalls++;
        return json(200, { accessToken: 'yeni', refreshToken: 'R2' });
      }
      const auth = new Headers(init?.headers).get('Authorization');
      return auth === 'Bearer yeni' ? json(200, { ok: true }) : json(401, {});
    });
    configureApiClient({ baseUrl: '', tokens, fetch: fetch as typeof globalThis.fetch });

    const results = await Promise.all([
      apiFetch('/todos'),
      apiFetch('/auth/me'),
      apiFetch('/products'),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
    expect(tokens.current).toEqual({ accessToken: 'yeni', refreshToken: 'R2' });
  });

  it('yenileme başarısızsa token siler ve onSessionExpired çağırır', async () => {
    const tokens = memoryTokens({ accessToken: 'eski', refreshToken: 'R1' });
    const onSessionExpired = vi.fn();
    configureApiClient({ baseUrl: '', tokens, onSessionExpired, fetch: async () => json(401, {}) });

    await expect(apiFetch('/todos')).rejects.toMatchObject({ status: 401 });
    expect(tokens.current).toBeNull();
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it('login isteğinin 401i yenileme tetiklemez (yanlış şifre)', async () => {
    const fetch = vi.fn(async () => json(401, { detail: 'Failed' }));
    configureApiClient({
      baseUrl: '',
      tokens: memoryTokens({ accessToken: 'A', refreshToken: 'R' }),
      fetch,
    });

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
    });
    expect(fetch).toHaveBeenCalledOnce();
  });
});

describe('applyFieldErrors', () => {
  it('alan hatalarını forma bağlar', () => {
    const setError = vi.fn();
    const error = new ApiError(400, {
      errors: { price: ["'Fiyat' 0'dan büyük olmalı."], name: ['Boş olamaz.'] },
    });

    expect(applyFieldErrors(error, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith('price', {
      type: 'server',
      message: "'Fiyat' 0'dan büyük olmalı.",
    });
    expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'Boş olamaz.' });
  });

  it('alan hatası yoksa ve 400 değilse false döner', () => {
    expect(applyFieldErrors(new ApiError(409, { code: 'x' }), vi.fn())).toBe(false);
    expect(applyFieldErrors(new Error('ağ hatası'), vi.fn())).toBe(false);
  });
});
