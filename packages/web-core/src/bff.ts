import type { Context, Hono, Next } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { getConnInfo } from '@hono/node-server/conninfo';
import { createContext, RouterContextProvider } from 'react-router';
import { sealSession, unsealSession, type Session } from './session';

/**
 * Web uygulamalarının ortak BFF'i (Backend for Frontend). Tarayıcı .NET API'ye hiç gitmez, token görmez:
 *
 *   /api/*                  → API'ye iletilir; oturumdaki token sunucuda eklenir, 401'de sunucuda yenilenir
 *   POST /api/auth/login    → giriş; token'lar şifreli httpOnly çereze yazılır, tarayıcıya {} döner
 *   POST /api/auth/exchange → sosyal giriş kodu (aynı şekilde) // ako:social
 *   POST /bff/logout        → çerezi siler
 *   GET  /bff/external/:provider  → sosyal girişi başlatır (API'nin /auth/external adresine yönlendirir) // ako:social
 *   GET  /bff/external/callback   → sağlayıcıdan dönüş: kod sunucuda token'a çevrilir, "/"a yönlendirir // ako:social
 *
 * Böylece api-client'ın üretilen hook'ları (useLogin dahil) web'de de değişmeden çalışır.
 */
export interface BffOptions {
  /** Sunucunun API'ye eriştiği adres, ör. "http://localhost:5165" ya da iç ağ adresi. */
  apiUrl: string;
  /** Tarayıcının API'ye eriştiği adres (yalnızca sosyal giriş yönlendirmesi için). Varsayılan: apiUrl. */
  apiPublicUrl?: string;
  /** Bu uygulamanın dışarıdan görünen adresi, ör. "http://localhost:5173". Sosyal giriş dönüşü için. */
  publicUrl: string;
  /** Çerez şifreleme anahtarı, en az 32 karakter. Uygulamanın tüm kopyalarında aynı olmalı. */
  sessionSecret: string;
  /** Uygulama başına farklı olmalı (site ve backoffice aynı alan adındaysa karışmasın). */
  cookieName?: string;
  /** Verilirse yalnızca bu role sahip kullanıcılar giriş yapabilir (backoffice: "Admin"). */
  requiredRole?: string;
  /** Testler için. */
  fetch?: typeof fetch;
}

/** Loader/action'larda oturuma erişim: context.get(sessionContext). */
export const sessionContext = createContext<Session | null>(null);

const REFRESH_TOKEN_DAYS = 14; // Identity'nin refresh token ömrüyle aynı

// API'ye iletilmeyen ya da geri dönmeyen başlıklar.
const DROPPED_REQUEST_HEADERS = ['cookie', 'host', 'connection', 'authorization', 'content-length'];
const DROPPED_RESPONSE_HEADERS = [
  'set-cookie',
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
];

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // saniye
}

const toSession = (tokens: TokenResponse): Session => ({
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  expiresAt: Date.now() + tokens.expiresIn * 1000,
});

// Bitişine bu kadar kalan token sayfa isteğinde önceden yenilenir (loader'lar arka arkaya API'ye gider).
const REFRESH_MARGIN_MS = 60_000;

const isExpired = (session: Session) =>
  session.expiresAt === undefined || session.expiresAt - REFRESH_MARGIN_MS < Date.now();

/** Sayfa (SSR) istekleri: /api, /bff ve dosya istekleri dışında kalanlar (React Router'ın .data istekleri dahil). */
const isPageRequest = (path: string) =>
  !path.startsWith('/api/') &&
  !path.startsWith('/bff/') &&
  (!/\.[a-z0-9]+$/i.test(path) || path.endsWith('.data'));

export function createBff(options: BffOptions) {
  const cookieName = options.cookieName ?? 'ako_session';
  const secure = options.publicUrl.startsWith('https://');
  const apiPublicUrl = options.apiPublicUrl ?? options.apiUrl; // ako:social
  const fetchApi = (path: string, init: RequestInit) =>
    (options.fetch ?? fetch)(options.apiUrl + path, init);

  const readSession = (c: Context) =>
    unsealSession(getCookie(c, cookieName), options.sessionSecret);

  async function writeSession(c: Context, session: Session | null) {
    if (!session) {
      deleteCookie(c, cookieName, { path: '/' });
      return;
    }
    setCookie(c, cookieName, await sealSession(session, options.sessionSecret), {
      httpOnly: true,
      secure,
      sameSite: 'Lax',
      path: '/',
      maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60,
    });
  }

  /** requiredRole varsa token sahibinin rolünü /auth/me ile doğrular. */
  async function hasRequiredRole(accessToken: string): Promise<boolean> {
    if (!options.requiredRole) {
      return true;
    }
    const me = await fetchApi('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!me.ok) {
      return false;
    }
    const { roles } = (await me.json()) as { roles: string[] };
    return roles.includes(options.requiredRole);
  }

  /** Giriş cevabındaki token'ları çereze yazar; tarayıcıya token yerine boş bir nesne döner. */
  async function completeLogin(c: Context, response: Response): Promise<Response> {
    if (!response.ok) {
      return toClientResponse(c, response);
    }
    const tokens = (await response.json()) as TokenResponse;
    if (!(await hasRequiredRole(tokens.accessToken))) {
      return c.json(
        { status: 403, code: 'auth.role_required', detail: 'Bu uygulamaya erişim yetkiniz yok.' },
        403,
      );
    }
    await writeSession(c, toSession(tokens));
    return c.json({});
  }

  async function refresh(session: Session): Promise<Session | null> {
    const response = await fetchApi('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!response.ok) {
      return null;
    }
    return toSession((await response.json()) as TokenResponse);
  }

  function forwardHeaders(c: Context, accessToken?: string): Headers {
    const headers = new Headers(c.req.raw.headers);
    for (const name of DROPPED_REQUEST_HEADERS) {
      headers.delete(name);
    }
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    // API'nin rate limiting'i gerçek istemci IP'sine baksın (API bu başlığa yalnızca güvendiği proxy'lerden inanır).
    const clientIp = clientAddress(c);
    if (clientIp) {
      const existing = headers.get('x-forwarded-for');
      headers.set('X-Forwarded-For', existing ? `${existing}, ${clientIp}` : clientIp);
    }
    return headers;
  }

  async function proxy(c: Context): Promise<Response> {
    const url = new URL(c.req.url);
    const path = url.pathname.slice('/api'.length) + url.search;
    const method = c.req.method;

    // Bu iki adres token döner; tarayıcıya değil çereze gider.
    // ako:begin social
    if (
      method === 'POST' &&
      (path.startsWith('/auth/login') || path.startsWith('/auth/exchange'))
    ) {
      // ako:else social
      //~ if (method === 'POST' && path.startsWith('/auth/login')) {
      // ako:end social
      const body = await c.req.arrayBuffer();
      return completeLogin(c, await fetchApi(path, { method, headers: forwardHeaders(c), body }));
    }
    // Token yenileme ve native giriş yalnızca BFF'in / mobilin işi; tarayıcıdan çağrılmaz.
    // ako:begin social
    if (path.startsWith('/auth/refresh') || path.startsWith('/auth/native')) {
      // ako:else social
      //~ if (path.startsWith('/auth/refresh')) {
      // ako:end social
      return c.notFound();
    }

    const body = method === 'GET' || method === 'HEAD' ? undefined : await c.req.arrayBuffer();
    let session = await readSession(c);
    let response = await fetchApi(path, {
      method,
      headers: forwardHeaders(c, session?.accessToken),
      body,
    });

    if (response.status === 401 && session) {
      session = await refresh(session);
      await writeSession(c, session); // başarısızsa çerez silinir (oturum bitti)
      if (session) {
        response = await fetchApi(path, {
          method,
          headers: forwardHeaders(c, session.accessToken),
          body,
        });
      }
    }

    return toClientResponse(c, response);
  }

  // Sayfa isteğinde yenilenen oturum, aynı isteğin getLoadContext'ine buradan geçer.
  const pageSessions = new WeakMap<Request, Session | null>();

  /**
   * Sayfa isteklerinde süresi dolan access token'ı loader'lar çalışmadan yeniler. Yenilenmezse loader'lar
   * API'ye geçersiz token'la gider (oturum var ama /me 401). Yenileme başarısızsa çerez silinir.
   * React Router yanıtı hazır bir Response döndürdüğü için çerez next()'ten sonra yazılır.
   */
  async function refreshPageSession(c: Context, next: Next) {
    if (!isPageRequest(c.req.path)) {
      return next();
    }
    const stored = await readSession(c);
    // API'ye ulaşılamazsa (ağ hatası) oturum silinmez; sayfa eski token'la sürer, hatayı loader'lar karşılar.
    const session =
      stored && isExpired(stored) ? await refresh(stored).catch(() => stored) : stored;
    pageSessions.set(c.req.raw, session);
    await next();
    if (session !== stored) {
      await writeSession(c, session);
    }
  }

  /** Hono uygulamasına BFF route'larını ekler (react-router-hono-server'ın configure kancası). */
  function configure(app: Hono) {
    app.use('*', refreshPageSession);
    app.all('/api/*', proxy);

    app.post('/bff/logout', async (c) => {
      await writeSession(c, null);
      return c.body(null, 204);
    });

    // ako:begin social
    app.get('/bff/external/callback', async (c) => {
      const error = c.req.query('error');
      const code = c.req.query('code');
      if (error || !code) {
        return c.redirect(`/login?error=${encodeURIComponent(error ?? 'auth.external_failed')}`);
      }
      const response = await completeLogin(
        c,
        await fetchApi('/auth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }),
      );
      return response.ok
        ? c.redirect('/')
        : c.redirect(`/login?error=${encodeURIComponent(await errorCode(response))}`);
    });

    app.get('/bff/external/:provider', (c) => {
      const returnUrl = `${options.publicUrl}/bff/external/callback`;
      return c.redirect(
        `${apiPublicUrl}/auth/external/${encodeURIComponent(c.req.param('provider'))}?returnUrl=${encodeURIComponent(returnUrl)}`,
      );
    });
    // ako:end social
  }

  /** Loader/action'lara oturumu verir (react-router-hono-server'ın getLoadContext kancası). */
  async function getLoadContext(c: Context) {
    const context = new RouterContextProvider();
    const session = pageSessions.has(c.req.raw)
      ? pageSessions.get(c.req.raw)!
      : await readSession(c);
    context.set(sessionContext, session);
    return context;
  }

  return { configure, getLoadContext };
}

/** Sunucu tarafında (loader) api-client çağrılarına eklenecek başlıklar: token ve dil. */
export function serverRequestInit(session: Session | null, request: Request): RequestInit {
  const headers: Record<string, string> = {};
  if (session) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  const language = request.headers.get('accept-language');
  if (language) {
    headers['Accept-Language'] = language;
  }
  return { headers };
}

/**
 * API yanıtını tarayıcıya iletir. c.newResponse kullanılır ki bu istekte yazılan oturum çerezi
 * (ör. yenilenen token) yanıta eklensin; doğrudan new Response dönülürse Set-Cookie kaybolur.
 */
function toClientResponse(c: Context, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const name of DROPPED_RESPONSE_HEADERS) {
    headers.delete(name);
  }
  return c.newResponse(response.body, response.status as never, Object.fromEntries(headers));
}

// ako:begin social
async function errorCode(response: Response): Promise<string> {
  try {
    return ((await response.clone().json()) as { code?: string }).code ?? 'auth.external_failed';
  } catch {
    return 'auth.external_failed';
  }
}
// ako:end social

function clientAddress(c: Context): string | undefined {
  try {
    return getConnInfo(c).remote.address;
  } catch {
    return undefined; // Node dışı ortam ya da test
  }
}
