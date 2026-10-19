import '~/lib/api';
import { ThemeProvider } from '@mari-ui/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { mariTheme } from '../mari-ui-theme';

function Themed({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <ThemeProvider theme={scheme === 'dark' ? mariTheme.dark : mariTheme.light} insets={insets}>
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Themed>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </Themed>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
