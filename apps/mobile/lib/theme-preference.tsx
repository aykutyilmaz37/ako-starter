import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

const KEY = 'ako.theme';

interface ThemeContext {
  preference: ThemePreference;
  /** Sistem tercihi çözülmüş, uygulanan tema. */
  scheme: 'light' | 'dark';
  setPreference: (next: ThemePreference) => void;
}

const Context = createContext<ThemeContext | null>(null);

/** Kullanıcının tema tercihi (sistem / açık / koyu) cihazda saklanır; "sistem" cihazın görünümünü izler. */
export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setState] = useState<ThemePreference>('system');

  useEffect(() => {
    void SecureStore.getItemAsync(KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setState(saved);
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setState(next);
    void (next === 'system'
      ? SecureStore.deleteItemAsync(KEY)
      : SecureStore.setItemAsync(KEY, next));
  }, []);

  const value = useMemo<ThemeContext>(
    () => ({
      preference,
      scheme: preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference,
      setPreference,
    }),
    [preference, system, setPreference],
  );

  return <Context value={value}>{children}</Context>;
}

export function useThemePreference(): ThemeContext {
  const value = useContext(Context);
  if (!value) throw new Error('useThemePreference ThemePreferenceProvider içinde kullanılmalı');
  return value;
}
