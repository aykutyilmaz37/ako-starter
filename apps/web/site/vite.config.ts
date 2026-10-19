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
  server: {
    port: 5173,
    // Port doluysa başka porta kaymak yerine hata ver: yanlış uygulamayı test etmeyelim.
    strictPort: true,
    // Geliştirmede her uygulama kendi alan adında (site.localhost:5173). Tarayıcı çerezleri alan adına göre ayırdığı
    // için site ve backoffice oturumları birbirini hiç görmez (production'daki ayrı domainler gibi).
    // *.localhost tarayıcılarda ek ayar gerektirmeden bu bilgisayara çözülür.
    allowedHosts: ['site.localhost'],
  },
});
