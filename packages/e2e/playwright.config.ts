import { defineConfig } from '@playwright/test';

const SITE = 'http://site.localhost:5173';
const ADMIN = 'http://admin.localhost:5174';

// Duman testi: API + iki web uygulaması çalışıyor olmalı (db: `pnpm db:up`). Çalışmıyorsa buradan başlatılır.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { trace: 'on-first-retry' },
  projects: [
    { name: 'site', testMatch: 'site.spec.ts', use: { baseURL: SITE } },
    { name: 'backoffice', testMatch: 'backoffice.spec.ts', use: { baseURL: ADMIN } },
  ],
  webServer: [
    {
      command: 'dotnet run --project ../../apps/api/src/Ako.Api --launch-profile http',
      url: 'http://localhost:5165/products',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'pnpm --filter @ako/web-site dev',
      url: SITE,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @ako/web-backoffice dev',
      url: ADMIN,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
