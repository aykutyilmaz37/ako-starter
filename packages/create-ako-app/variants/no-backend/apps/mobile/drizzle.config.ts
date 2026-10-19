import { defineConfig } from 'drizzle-kit';

// `pnpm db:generate`: şemadan SQL migration'ı ve uygulamaya paketlenen drizzle/migrations.js üretir.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './features/*/data/schema.ts',
  out: './drizzle',
});
