import { createBff } from '@ako/web-core';
import { createHonoServer } from 'react-router-hono-server/node';
import { env } from './env.server';

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
  getLoadContext: bff.getLoadContext,
});
