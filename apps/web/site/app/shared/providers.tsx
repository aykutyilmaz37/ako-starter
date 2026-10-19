import { ToastProvider } from '@mari-ui/components/toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { z } from 'zod';

// Form doğrulama mesajları Türkçe. (i18n kararı verilince dile göre seçilecek.)
z.config(z.locales.tr());

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
