import { existsSync } from 'node:fs';

// Yerelde .env dosyası varsa okunur; production'da değerler ortam değişkeni olarak verilir.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const isProduction = process.env.NODE_ENV === 'production';

function sessionSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (isProduction) throw new Error('SESSION_SECRET ortam değişkeni zorunlu (en az 32 karakter).');
  return 'yalnizca-yerel-gelistirme-icin-session-secret'; // geliştirmede kolaylık
}

export const env = {
  apiUrl: process.env.API_URL ?? 'http://localhost:5165',
  apiPublicUrl: process.env.API_PUBLIC_URL || undefined,
  publicUrl: process.env.PUBLIC_URL ?? 'http://localhost:5174',
  sessionSecret: sessionSecret(),
};
