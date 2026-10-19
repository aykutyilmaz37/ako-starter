import { Button, Text, useTheme } from '@mari-ui/native';
import { View } from 'react-native';
import { useT } from '~/features/localization/i18n';
import { useSession } from '~/features/auth/session';

export function OfflineScreen() {
  const { retry } = useSession();
  const t = useT();
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
      <Text>{t('session.offline')}</Text>
      <Button onPress={retry}>{t('common.retry')}</Button>
    </View>
  );
}
