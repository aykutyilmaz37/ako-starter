import { configureApiClient } from '@ako/api-client';
import { ToastProvider } from '@mari-ui/components/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { z } from 'zod';

// Form doğrulama mesajları Türkçe. (i18n kararı verilince dile göre seçilecek.)
z.config(z.locales.tr());

/**
 * api-client'ı ortama göre ayarlar. Uygulamanın kök modülünde (root.tsx) bir kez çağrılır.
 *   tarayıcı → "/api" (aynı sitedeki BFF; token çerezde, tarayıcı görmez)
 *   sunucu   → API'nin kendisi (loader'lar token'ı serverRequestInit ile ekler)
 */
export function configureWebApiClient(serverApiUrl: string | undefined) {
  const isServer = typeof window === 'undefined';
  configureApiClient({
    baseUrl: isServer ? (serverApiUrl ?? 'http://localhost:5165') : '/api',
    getLanguage: () => 'tr',
    credentials: 'same-origin',
  });
}

/** TanStack Query + bildirimler. root.tsx'teki uygulamayı sarar. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
