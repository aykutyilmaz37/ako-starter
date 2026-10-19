import { createBff } from '@ako/web-core';
import { createHonoServer } from 'react-router-hono-server/node';
import { env } from './env.server';
import { resolveRequestLanguage } from './shared/i18n/dictionary.server';
import { languageContext } from './shared/i18n/language-context';

// Hono sunucusu: önce BFF route'ları (/api/*, /bff/*), sonra React Router sayfaları.
const bff = createBff({
  apiUrl: env.apiUrl,
  apiPublicUrl: env.apiPublicUrl,
  publicUrl: env.publicUrl,
  sessionSecret: env.sessionSecret,
  cookieName: 'ako_site',
});

export default await createHonoServer({
  configure: bff.configure,
  // Loader'lara oturum (BFF) ve istek dili (adresin ilk parçası) verilir.
  getLoadContext: async (c) => {
    const context = await bff.getLoadContext(c);
    context.set(languageContext, await resolveRequestLanguage(c.req.path));
    return context;
  },
});
