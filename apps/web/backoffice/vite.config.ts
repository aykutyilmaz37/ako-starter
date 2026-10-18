import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import { defineConfig } from 'vite';

// Hono sunucu eklentisi reactRouter()'dan ÖNCE gelmeli.
export default defineConfig({
  plugins: [tailwindcss(), reactRouterHonoServer(), reactRouter()],
  // Port doluysa başka porta kaymak yerine hata ver: yanlış uygulamayı test etmeyelim.
  server: { port: 5174, strictPort: true },
});
