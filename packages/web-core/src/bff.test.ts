import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { createBff, sessionContext } from './bff';
import { sealSession, unsealSession } from './session';

const SECRET = 'test-secret-test-secret-test-secret!!';
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Sahte API: geçerli access token "A2"; "A1" süresi dolmuş sayılır. */
function fakeApi(roles = ['User']) {
  const calls: { path: string; auth: string | null; forwardedFor: string | null }[] = [];
  const fetch = async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url).replace('http://api', '');
    const headers = new Headers(init?.headers);
    calls.push({
      path,
      auth: headers.get('authorization'),
      forwardedFor: headers.get('x-forwarded-for'),
    });
    if (path === '/auth/exchange')
      return String(init?.body).includes('bad-code')
        ? json(400, { code: 'auth.external_failed' })
        : json(200, { accessToken: 'A1', refreshToken: 'R1', expiresIn: 3600 });
    if (path.startsWith('/auth/login'))
      return json(200, { accessToken: 'A1', refreshToken: 'R1', expiresIn: 3600 });
    if (path === '/auth/refresh')
      return String(init?.body).includes('R-dead')
        ? json(401, {})
        : json(200, { accessToken: 'A2', refreshToken: 'R2', expiresIn: 3600 });
    if (path === '/auth/me') return json(200, { roles });
    if (path === '/todos')
      return headers.get('authorization') === 'Bearer A2' ? json(200, [{ id: 1 }]) : json(401, {});
    return json(404, {});
  };
  return { fetch: fetch as typeof globalThis.fetch, calls };
}

function app(options: { roles?: string[]; requiredRole?: string } = {}) {
  const api = fakeApi(options.roles);
  const hono = new Hono();
  const bff = createBff({
    apiUrl: 'http://api',
    publicUrl: 'http://site',
    sessionSecret: SECRET,
    requiredRole: options.requiredRole,
    fetch: api.fetch,
  });
  bff.configure(hono);
  // React Router gibi: loader'ların gördüğü oturumu hazır bir Response olarak döner.
  hono.get('*', async (c) => Response.json((await bff.getLoadContext(c)).get(sessionContext)));
  return { hono, api };
}

const cookieOf = (response: Response) => response.headers.get('set-cookie')?.split(';')[0] ?? '';

describe('BFF', () => {
  it('girişte token tarayıcıya dönmez, şifreli çereze yazılır', async () => {
    const { hono } = app();
    const response = await hono.request('/api/auth/login', { method: 'POST', body: '{}' });

    expect(await response.json()).toEqual({});
    const cookie = cookieOf(response);
    expect(cookie).toMatch(/^ako_session=/);
    // Çerez şifreli: açık hâli (base64'ten çözülmüş) token'ı içermez. ("A1"in çerez metninde geçmemesine
    // bakmak rastgele şifreli metinde ara sıra tutmuyordu.)
    for (const part of cookie.split('=')[1]!.split('.')) {
      expect(Buffer.from(part, 'base64url').toString('utf8')).not.toContain('"A1"');
    }
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(await unsealSession(cookie.split('=')[1], SECRET)).toMatchObject({
      accessToken: 'A1',
      refreshToken: 'R1',
      expiresAt: expect.any(Number),
    });
  });

  it('proxy token ekler; 401de sunucuda yeniler, çerezi günceller ve isteği tekrarlar', async () => {
    const { hono, api } = app();
    const cookie = `ako_session=${await sealSession({ accessToken: 'A1', refreshToken: 'R1' }, SECRET)}`;

    const response = await hono.request('/api/todos', { headers: { cookie } });

    expect(response.status).toBe(200);
    expect(api.calls.map((c) => `${c.path} ${c.auth ?? ''}`.trim())).toEqual([
      '/todos Bearer A1',
      '/auth/refresh',
      '/todos Bearer A2',
    ]);
    expect(await unsealSession(cookieOf(response).split('=')[1], SECRET)).toMatchObject({
      accessToken: 'A2',
      refreshToken: 'R2',
    });
  });

  it('sayfa isteğinde süresi dolan token loader çalışmadan yenilenir ve çereze yazılır', async () => {
    const { hono, api } = app();
    const expired = { accessToken: 'A1', refreshToken: 'R1', expiresAt: Date.now() - 1000 };
    const cookie = `ako_session=${await sealSession(expired, SECRET)}`;

    const response = await hono.request('/products', { headers: { cookie } });

    expect(await response.json()).toMatchObject({ accessToken: 'A2', refreshToken: 'R2' });
    expect(api.calls.map((c) => c.path)).toEqual(['/auth/refresh']);
    expect(await unsealSession(cookieOf(response).split('=')[1], SECRET)).toMatchObject({
      accessToken: 'A2',
    });
  });

  it('sayfa isteğinde yenileme başarısızsa oturum düşer ve çerez silinir', async () => {
    const { hono } = app();
    const dead = { accessToken: 'A1', refreshToken: 'R-dead' }; // bitiş bilgisi olmayan eski çerez
    const cookie = `ako_session=${await sealSession(dead, SECRET)}`;

    const response = await hono.request('/', { headers: { cookie } });

    expect(await response.json()).toBeNull();
    expect(response.headers.get('set-cookie')).toMatch(/^ako_session=;.*Max-Age=0/);
  });

  it("sayfa isteğinde API'ye ulaşılamazsa oturum korunur, sayfa düşmez", async () => {
    const hono = new Hono();
    const bff = createBff({
      apiUrl: 'http://api',
      publicUrl: 'http://site',
      sessionSecret: SECRET,
      fetch: (async () => {
        throw new TypeError('fetch failed');
      }) as typeof globalThis.fetch,
    });
    bff.configure(hono);
    hono.get('*', async (c) => Response.json((await bff.getLoadContext(c)).get(sessionContext)));
    const expired = { accessToken: 'A1', refreshToken: 'R1', expiresAt: Date.now() - 1000 };
    const cookie = `ako_session=${await sealSession(expired, SECRET)}`;

    const response = await hono.request('/', { headers: { cookie } });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ accessToken: 'A1' });
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('süresi dolmamış token sayfa isteğinde yenilenmez', async () => {
    const { hono, api } = app();
    const valid = { accessToken: 'A2', refreshToken: 'R2', expiresAt: Date.now() + 3_600_000 };
    const cookie = `ako_session=${await sealSession(valid, SECRET)}`;

    const response = await hono.request('/', { headers: { cookie } });

    expect(await response.json()).toMatchObject({ accessToken: 'A2' });
    expect(api.calls).toEqual([]);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('tarayıcı refresh ve native adreslerine erişemez', async () => {
    const { hono } = app();
    expect((await hono.request('/api/auth/refresh', { method: 'POST' })).status).toBe(404);
    expect((await hono.request('/api/auth/native/google', { method: 'POST' })).status).toBe(404); // ako:social
  });

  it('gerekli rolü olmayan kullanıcı giriş yapamaz (backoffice)', async () => {
    const { hono } = app({ roles: ['User'], requiredRole: 'Admin' });
    const response = await hono.request('/api/auth/login', { method: 'POST', body: '{}' });

    expect(response.status).toBe(403);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('değiştirilmiş çerez oturum sayılmaz', async () => {
    const sealed = await sealSession({ accessToken: 'A2', refreshToken: 'R2' }, SECRET);
    expect(await unsealSession(sealed.slice(0, -2) + 'xx', SECRET)).toBeNull();
    expect(await unsealSession(sealed, 'baska-secret-baska-secret-baska-secret')).toBeNull();
  });

  // ako:begin social
  it('sosyal giriş API üzerinden başlar, dönüş adresi BFF callback olur', async () => {
    const { hono } = app();
    const response = await hono.request('/bff/external/github');

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      'http://api/auth/external/github?returnUrl=' +
        encodeURIComponent('http://site/bff/external/callback'),
    );
  });

  it('sosyal girişte dönüş adresi (dil öneki) korunur', async () => {
    const { hono } = app();
    const start = await hono.request('/bff/external/github?next=%2Fen&login=%2Fen%2Flogin');
    const returnCookie = cookieOf(start);
    expect(returnCookie).toMatch(/^ako_session_return=/);

    const ok = await hono.request('/bff/external/callback?code=good', {
      headers: { cookie: returnCookie },
    });
    expect(ok.headers.get('location')).toBe('/en');

    const failed = await hono.request('/bff/external/callback?code=bad-code', {
      headers: { cookie: returnCookie },
    });
    expect(failed.headers.get('location')).toBe('/en/login?error=auth.external_failed');
  });

  it('sosyal girişte başka siteye dönüş adresi kabul edilmez', async () => {
    const { hono } = app();
    const start = await hono.request(
      '/bff/external/github?next=%2F%2Fevil.example&login=https%3A%2F%2Fevil.example',
    );
    const response = await hono.request('/bff/external/callback?error=auth.cancelled', {
      headers: { cookie: cookieOf(start) },
    });
    expect(response.headers.get('location')).toBe('/login?error=auth.cancelled');

    const ok = await hono.request('/bff/external/callback?code=good', {
      headers: { cookie: cookieOf(start) },
    });
    expect(ok.headers.get('location')).toBe('/');
  });
  // ako:end social

  it("sağlık kontrolü API'ye gitmeden yanıt verir", async () => {
    const { hono, api } = app();
    const response = await hono.request('/health');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
    expect(api.calls).toEqual([]);
  });
});
