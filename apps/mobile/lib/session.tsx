import { isApiError, setAuthTokens, type AuthTokens } from '@ako/api-client';
import { useGetMe } from '@ako/api-client/auth';
import type { MeResponse } from '@ako/api-client/model';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setSessionExpiredHandler } from '~/lib/api';
import { tokenStore } from '~/lib/token-store';

type Status = 'loading' | 'anonymous' | 'authenticated' | 'offline';

interface Session {
  status: Status;
  user: MeResponse | null;
  /** Giriş cevabındaki token'ları saklar ve oturumu açar. */
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  /** Sunucuya ulaşılamayınca "tekrar dene". */
  retry: () => void;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  // null: cihazdaki token henüz okunmadı.
  const [hasTokens, setHasTokens] = useState<boolean | null>(null);

  useEffect(() => {
    void Promise.resolve(tokenStore.get()).then((tokens) => setHasTokens(tokens !== null));
  }, []);

  const signOut = useCallback(async () => {
    await setAuthTokens(null);
    queryClient.clear();
    setHasTokens(false);
  }, [queryClient]);

  // Refresh de reddedilince api-client çağırır (token'lar zaten silinmiştir).
  useEffect(() => {
    setSessionExpiredHandler(() => void signOut());
  }, [signOut]);

  const me = useGetMe({ query: { enabled: hasTokens === true, retry: false } });

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      await setAuthTokens(tokens);
      setHasTokens(true);
      await queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const value = useMemo<Session>(() => {
    let status: Status;
    if (hasTokens === null) status = 'loading';
    else if (!hasTokens) status = 'anonymous';
    else if (me.data) status = 'authenticated';
    else if (me.error) status = isApiError(me.error) ? 'anonymous' : 'offline';
    else status = 'loading';

    return {
      status,
      user: me.data ?? null,
      signIn,
      signOut,
      retry: () => void me.refetch(),
    };
  }, [hasTokens, me.data, me.error, me.refetch, signIn, signOut]);

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession SessionProvider içinde kullanılmalı');
  return session;
}
