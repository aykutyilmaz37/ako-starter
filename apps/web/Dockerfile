# Web uygulamalarının (site, backoffice) container imajı; hangisi olduğu APP ile seçilir.
# Derleme bağlamı repo kökü (workspace paketleri ve lockfile gerekir). Bağlama giren dosyalar Dockerfile.dockerignore'da.
#   docker build -f apps/web/Dockerfile --build-arg APP=site -t ako-site .
#   docker build -f apps/web/Dockerfile --build-arg APP=backoffice -t ako-backoffice .
# Çalışma: http://<host>:3000. Ayarlar ortam değişkeniyle: API_URL, API_PUBLIC_URL, PUBLIC_URL, SESSION_SECRET (.env.example).

ARG NODE_VERSION=24

# --- derleme ---
FROM node:${NODE_VERSION}-slim AS build
ARG APP
RUN test -n "$APP" || (echo "APP derleme argümanı zorunlu: site ya da backoffice" && exit 1)
# pnpm sürümü kök package.json'daki packageManager alanından gelir.
RUN corepack enable
WORKDIR /repo
COPY . .
# Yalnızca bu uygulama ve bağımlı olduğu workspace paketleri kurulur (mobil, API araçları gelmez).
RUN pnpm install --frozen-lockfile --filter "@ako/web-${APP}..."
RUN pnpm --filter "@ako/web-${APP}" build
# Çalışma için yalnızca üretim bağımlılıkları: workspace paketleri (@ako/*) zaten sunucu paketine gömülü.
RUN pnpm --filter "@ako/web-${APP}" deploy --prod /out \
 && cp -r "apps/web/${APP}/build" /out/build

# --- çalışma ---
FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=build /out/package.json ./
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/build ./build

# Node imajındaki root olmayan "node" kullanıcısı.
USER node
EXPOSE 3000

# Sağlık kontrolü çalıştıran ortamda tanımlanır (bkz. compose.prod.yaml); canlılık: GET /health
#   node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node", "build/server/index.js"]
