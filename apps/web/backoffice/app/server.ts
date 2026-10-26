import { createBff, noIndex } from '@ako/web-core';
import { createHonoServer } from 'react-router-hono-server/node';
import { getCookie } from 'hono/cookie';
import { env } from './env.server';
import { resolveRequestLanguage } from './shared/i18n/dictionary.server';
import { LANGUAGE_COOKIE, languageContext } from './shared/i18n/language-context';

// Backoffice BFF'i: yalnızca Admin rolü giriş yapabilir. API_URL iç ağdaki (admin endpoint'leri açık) API'yi gösterir.
const bff = createBff({
  apiUrl: env.apiUrl,
  apiPublicUrl: env.apiPublicUrl,
  publicUrl: env.publicUrl,
  sessionSecret: env.sessionSecret,
  cookieName: 'ako_backoffice',
  requiredRole: 'Admin',
});

export default await createHonoServer({
  configure(app) {
    // Geliştirme aracı (uygulamadaki önizleme paneli) hazır olup olmadığını HEAD / ile sorar. Backoffice'te "/"
    // giriş istediği için 302 döner ve araç sunucuyu hiç hazır saymaz. Gövde dönmediği için bir şey açığa çıkmaz.
    if (process.env.NODE_ENV !== 'production') {
      // (Hono HEAD isteklerini GET route'larına yönlendirdiği için app.on('HEAD') eşleşmez; middleware gerekir.)
      app.use('/', async (c, next) => (c.req.method === 'HEAD' ? c.body(null, 200) : next()));
    }
    app.use('*', noIndex);
    bff.configure(app);
  },
  // Loader'lara oturum (BFF) ve arayüz dili (ako_lang çerezi) verilir.
  getLoadContext: async (c) => {
    const context = await bff.getLoadContext(c);
    context.set(languageContext, await resolveRequestLanguage(getCookie(c, LANGUAGE_COOKIE)));
    return context;
  },
});
