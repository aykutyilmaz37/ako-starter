import '~/lib/api';
import { PlayfairDisplay_700Bold, useFonts } from '@expo-google-fonts/playfair-display';
import { ThemeProvider, ToastProvider, useTheme } from '@mari-ui/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineScreen } from '~/components/offline-screen';
import { I18nProvider } from '~/lib/i18n';
import { SessionProvider, useSession } from '~/lib/session';
import { ThemePreferenceProvider, useThemePreference } from '~/lib/theme-preference';
import { mariTheme } from '../mari-ui-theme';

// Tema tercihi (sistem / açık / koyu) Hesap sekmesinden seçilir; "sistem" cihazın görünümünü izler.
function Themed({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { scheme } = useThemePreference();
  return (
    <ThemeProvider theme={mariTheme[scheme]} insets={insets}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ToastProvider insets={insets}>{children}</ToastProvider>
    </ThemeProvider>
  );
}

function Routes() {
  const { status } = useSession();
  const surface = useTheme().color.canvas.surface;

  // Token okunurken / ilk /auth/me beklenirken boş yüzey: ekran göz kırpmasın.
  if (status === 'loading') return <View style={{ flex: 1, backgroundColor: surface }} />;
  if (status === 'offline') return <OfflineScreen />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: surface } }}>
      {/* Katalog herkese açık; giriş yalnızca alışveriş listesi gibi kişisel ekranlar için gerekir. */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="product/[id]" />
      <Stack.Protected guard={status === 'guest'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts({ PlayfairDisplay_700Bold });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <SessionProvider>
            <ThemePreferenceProvider>
              <Themed>
                <Routes />
              </Themed>
            </ThemePreferenceProvider>
          </SessionProvider>
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
