import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Hono sunucu eklentisi reactRouter()'dan ÖNCE gelmeli.
export default defineConfig({
  // ~/… → app/…  (üst klasöre çıkan göreli importlar yerine; tsconfig.json'daki paths ile aynı)
  resolve: { alias: { '~': fileURLToPath(new URL('./app', import.meta.url)) } },
  plugins: [tailwindcss(), reactRouterHonoServer(), reactRouter()],
  // Port doluysa başka porta kaymak yerine hata ver: yanlış uygulamayı test etmeyelim.
  server: { port: 5173, strictPort: true },
});
