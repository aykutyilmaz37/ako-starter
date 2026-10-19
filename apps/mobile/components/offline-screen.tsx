import { Button, Text, useTheme } from '@mari-ui/native';
import { View } from 'react-native';
import { useSession } from '~/lib/session';
import { s } from '~/lib/strings';

export function OfflineScreen() {
  const { retry } = useSession();
  const surface = useTheme().color.canvas.surface;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 16,
      }}
    >
      <Text>{s.session.offline}</Text>
      <Button onPress={retry}>{s.session.retry}</Button>
    </View>
  );
}
