import '~/lib/api';
import { ThemeProvider, ToastProvider, useTheme } from '@mari-ui/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '~/lib/session';
import { OfflineScreen } from '~/components/offline-screen';
import { mariTheme } from '../mari-ui-theme';

function Themed({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <ThemeProvider theme={scheme === 'dark' ? mariTheme.dark : mariTheme.light} insets={insets}>
      <ToastProvider insets={insets}>{children}</ToastProvider>
    </ThemeProvider>
  );
}

function Routes() {
  const { status } = useSession();
  // Native stack ve kök görünüm sistemin arka planını kullanır; tema yüzeyini (açık/koyu) kendimiz veririz.
  const surface = useTheme().color.canvas.surface;

  // Token okunurken / ilk /auth/me beklenirken boş ekran: giriş ekranı göz kırpmasın.
  if (status === 'loading') return <View style={{ flex: 1, backgroundColor: surface }} />;
  if (status === 'offline') return <OfflineScreen />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: surface } }}>
      {/* Katalog herkese açık; giriş yalnızca alışveriş listesi gibi kişisel ekranlar için gerekir. */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={status === 'anonymous'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <Themed>
            <StatusBar style="auto" />
            <Routes />
          </Themed>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
