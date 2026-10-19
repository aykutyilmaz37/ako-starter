import { isApiError, setAuthTokens, type AuthTokens } from '@ako/api-client';
import { claimGuest, createGuest, useGetMe } from '@ako/api-client/auth';
import type { MeResponse } from '@ako/api-client/model';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { setSessionExpiredHandler } from '~/shared/lib/api';
import { tokenStore } from '~/features/auth/token-store';

/**
 * Oturum durumları (karar: DECISIONS.md "Misafir ve kimlik"):
 *  - guest: token'ı olan misafir (anonim kullanıcı). Uygulama ilk açılışta otomatik misafir olur; her istek bearer'lıdır.
 *  - member: kayıtlı kullanıcı.
 */
type Status = 'loading' | 'guest' | 'member' | 'offline';

interface Session {
  status: Status;
  /** Kayıtlı kullanıcı; misafirken null. */
  user: MeResponse | null;
  /** Giriş cevabındaki token'ları saklar ve oturumu açar; misafirken yapılanlar hesaba taşınır. */
  signIn: (tokens: AuthTokens) => Promise<void>;
  /** Çıkış: yeni bir misafir oturumu başlar. */
  signOut: () => Promise<void>;
  /** Sunucuya ulaşılamayınca "tekrar dene". */
  retry: () => void;
}

const SessionContext = createContext<Session | null>(null);

// Misafirken alınan refresh token: kayıt / giriş sonrası "misafiri hesaba al" (claim) çağrısına kadar saklanır.
// Kayıt → kod doğrulama → giriş arasında uygulama kapansa bile kaybolmaz; talep başarılı olunca silinir.
const CLAIM_KEY = 'ako.guest-claim';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  // null: cihazdaki token henüz okunmadı; false: token yok / misafir oluşturuluyor.
  const [hasTokens, setHasTokens] = useState<boolean | null>(null);
  const [offline, setOffline] = useState(false);
  const statusRef = useRef<Status>('loading');

  const startGuest = useCallback(async () => {
    try {
      await setAuthTokens(await createGuest());
      setOffline(false);
      setHasTokens(true);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve(tokenStore.get()).then((tokens) => {
      if (tokens) setHasTokens(true);
      else void startGuest();
    });
  }, [startGuest]);

  /** Oturum bozuldu (token'lar yenilenemedi, kullanıcı silinmiş...): temizle ve yeni misafir başlat. */
  const reset = useCallback(async () => {
    await setAuthTokens(null);
    queryClient.clear();
    setHasTokens(false);
    await startGuest();
  }, [queryClient, startGuest]);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(CLAIM_KEY);
    await reset();
  }, [reset]);

  // Refresh de reddedilince api-client çağırır (token'lar zaten silinmiştir).
  useEffect(() => {
    setSessionExpiredHandler(() => void reset());
  }, [reset]);

  const me = useGetMe({ query: { enabled: hasTokens === true, retry: false } });

  // /auth/me yenilemeden sonra da 401 verirse kullanıcı silinmiştir (ör. süresi dolan misafir).
  const meError = me.error;
  useEffect(() => {
    if (isApiError(meError) && meError.status === 401) void reset();
  }, [meError, reset]);

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      const current = await tokenStore.get();
      if (current && statusRef.current === 'guest') {
        await SecureStore.setItemAsync(CLAIM_KEY, current.refreshToken);
      }
      await setAuthTokens(tokens);
      setHasTokens(true);
      await queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const status = useMemo<Status>(() => {
    if (offline) return 'offline';
    if (hasTokens !== true) return 'loading';
    if (me.data) return me.data.roles.includes('Guest') ? 'guest' : 'member';
    if (me.error && !isApiError(me.error)) return 'offline';
    return 'loading';
  }, [offline, hasTokens, me.data, me.error]);
  statusRef.current = status;

  // Kayıtlı kullanıcı olunca bekleyen misafir verisini hesaba al. Ağ hatasında saklanır, bir sonraki açılışta denenir.
  useEffect(() => {
    if (status !== 'member') return;
    void (async () => {
      const guestRefreshToken = await SecureStore.getItemAsync(CLAIM_KEY);
      if (!guestRefreshToken) return;
      try {
        await claimGuest({ guestRefreshToken });
      } catch (e) {
        if (!isApiError(e)) return; // ağ hatası: sonra tekrar
        // 400 (geçersiz/süresi dolmuş misafir): yapılacak bir şey yok, vazgeç.
      }
      await SecureStore.deleteItemAsync(CLAIM_KEY);
      await queryClient.invalidateQueries();
    })();
  }, [status, queryClient]);

  const value = useMemo<Session>(
    () => ({
      status,
      user: status === 'member' ? (me.data ?? null) : null,
      signIn,
      signOut,
      retry: () => {
        if (hasTokens === true) void me.refetch();
        else void startGuest();
      },
    }),
    [status, me.data, signIn, signOut, hasTokens, me.refetch, startGuest],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession SessionProvider içinde kullanılmalı');
  return session;
}
