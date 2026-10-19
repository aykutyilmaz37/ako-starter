import { useTheme } from '@mari-ui/native';
import { Stack } from 'expo-router';

/** Ekran arka planı tema yüzeyi: native stack varsayılanı sistemin açık rengidir, koyu temada yazıları gizler. */
export function ThemedStack() {
  const surface = useTheme().color.canvas.surface;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: surface } }} />
  );
}
