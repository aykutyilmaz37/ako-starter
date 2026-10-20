import { isApiError, setAuthTokens, type AuthTokens } from '@ako/api-client';
// ako:begin guest
import { claimGuest, createGuest, useGetMe } from '@ako/api-client/auth';
// ako:else guest
//~ import { useGetMe } from '@ako/api-client/auth';
// ako:end guest
import type { MeResponse } from '@ako/api-client/model';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store'; // ako:guest
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef, // ako:guest
  useState,
} from 'react';
import { setSessionExpiredHandler } from '~/shared/lib/api';
import { tokenStore } from '~/features/auth/token-store';

/**
 * Oturum durumları (karar: DECISIONS.md "Misafir ve kimlik"):
 *  - anonymous: kayıtlı olmayan kullanıcı. Misafir girişi açıksa token'ı olan misafirdir (uygulama ilk açılışta
 *    otomatik misafir olur, her istek bearer'lıdır); kapalıysa token'ı yoktur, kişisel ekranlar için giriş gerekir.
 *  - member: kayıtlı kullanıcı.
 */
type Status = 'loading' | 'anonymous' | 'member' | 'offline';

interface Session {
  status: Status;
  /** Kayıtlı kullanıcı; anonimken null. */
  user: MeResponse | null;
  /** Giriş cevabındaki token'ları saklar ve oturumu açar (misafir açıksa misafirken yapılanlar hesaba taşınır). */
  signIn: (tokens: AuthTokens) => Promise<void>;
  /** Çıkış (misafir açıksa yeni bir misafir oturumu başlar). */
  signOut: () => Promise<void>;
  /** Sunucuya ulaşılamayınca "tekrar dene". */
  retry: () => void;
}

const SessionContext = createContext<Session | null>(null);

// ako:begin guest
// Misafirken alınan refresh token: kayıt / giriş sonrası "misafiri hesaba al" (claim) çağrısına kadar saklanır.
// Kayıt → kod doğrulama → giriş arasında uygulama kapansa bile kaybolmaz; talep başarılı olunca silinir.
const CLAIM_KEY = 'ako.guest-claim';
// ako:end guest

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  // null: cihazdaki token henüz okunmadı; false: token yok (misafir açıksa oluşturuluyor).
  const [hasTokens, setHasTokens] = useState<boolean | null>(null);
  const [offline, setOffline] = useState(false); // ako:guest
  const statusRef = useRef<Status>('loading'); // ako:guest

  // ako:begin guest
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
  // ako:else guest
  //~ useEffect(() => {
  //~   void Promise.resolve(tokenStore.get()).then((tokens) => setHasTokens(tokens !== null));
  //~ }, []);
  //~
  //~ /** Oturum bozuldu (token'lar yenilenemedi, kullanıcı silinmiş...) ya da çıkış: token'ları ve önbelleği temizle. */
  //~ const reset = useCallback(async () => {
  //~   await setAuthTokens(null);
  //~   queryClient.clear();
  //~   setHasTokens(false);
  //~ }, [queryClient]);
  //~
  //~ const signOut = reset;
  // ako:end guest

  // Refresh de reddedilince api-client çağırır (token'lar zaten silinmiştir).
  useEffect(() => {
    setSessionExpiredHandler(() => void reset());
  }, [reset]);

  const me = useGetMe({ query: { enabled: hasTokens === true, retry: false } });

  // /auth/me yenilemeden sonra da 401 verirse kullanıcı silinmiştir (ör. süresi dolan misafir, yönetimden silinen hesap).
  const meError = me.error;
  useEffect(() => {
    // Dış bir olaya (API'nin 401'i) tepki olarak oturum sıfırlanır; render'dan türetilecek bir durum değil.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isApiError(meError) && meError.status === 401) void reset();
  }, [meError, reset]);

  const signIn = useCallback(
    async (tokens: AuthTokens) => {
      // ako:begin guest
      const current = await tokenStore.get();
      if (current && statusRef.current === 'anonymous') {
        await SecureStore.setItemAsync(CLAIM_KEY, current.refreshToken);
      }
      // ako:end guest
      await setAuthTokens(tokens);
      setHasTokens(true);
      await queryClient.invalidateQueries();
    },
    [queryClient],
  );

  // ako:begin guest
  const status = useMemo<Status>(() => {
    if (offline) return 'offline';
    if (hasTokens !== true) return 'loading';
    if (me.data) return me.data.roles.includes('Guest') ? 'anonymous' : 'member';
    if (me.error && !isApiError(me.error)) return 'offline';
    return 'loading';
  }, [offline, hasTokens, me.data, me.error]);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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
  // ako:else guest
  //~ const status = useMemo<Status>(() => {
  //~   if (hasTokens === null) return 'loading';
  //~   if (!hasTokens) return 'anonymous';
  //~   if (me.data) return 'member';
  //~   if (me.error) return isApiError(me.error) ? 'anonymous' : 'offline';
  //~   return 'loading';
  //~ }, [hasTokens, me.data, me.error]);
  // ako:end guest

  const value = useMemo<Session>(
    () => ({
      status,
      user: status === 'member' ? (me.data ?? null) : null,
      signIn,
      signOut,
      // ako:begin guest
      retry: () => {
        if (hasTokens === true) void me.refetch();
        else void startGuest();
      },
      // ako:else guest
      //~ retry: () => void me.refetch(),
      // ako:end guest
    }),
    // ako:begin guest
    [status, me.data, signIn, signOut, hasTokens, me.refetch, startGuest],
    // ako:else guest
    //~ [status, me.data, signIn, signOut, me.refetch],
    // ako:end guest
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession SessionProvider içinde kullanılmalı');
  return session;
}
