import { createBff } from '@ako/web-core';
import { createHonoServer } from 'react-router-hono-server/node';
import { env } from './env.server';

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
    bff.configure(app);
  },
  getLoadContext: bff.getLoadContext,
});
