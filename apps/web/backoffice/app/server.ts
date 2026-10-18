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
  configure: bff.configure,
  getLoadContext: bff.getLoadContext,
});
