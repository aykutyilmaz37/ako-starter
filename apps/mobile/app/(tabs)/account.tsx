import { Avatar, Button, Paragraph, Segmented, Text, useTheme } from '@mari-ui/native';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Heading, Muted } from '~/components/ui';
import { RADIUS } from '~/lib/brand';
import { useSession } from '~/lib/session';
import { useThemePreference, type ThemePreference } from '~/lib/theme-preference';

/** Hesap sekmesi: giriş isteğe bağlıdır; giriş yapılmamışsa davet, yapılmışsa profil ve çıkış. */
export default function Account() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useSession();
  const { preference, setPreference } = useThemePreference();

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: insets.top + 20, gap: 20 }}>
      <View style={{ gap: 4 }}>
        <Eyebrow>Hesap</Eyebrow>
        <Heading size={32}>{user ? 'Merhaba' : 'Akı ailesine katıl'}</Heading>
      </View>

      {user ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: color.canvas.border,
            backgroundColor: color.canvas.surfaceAlt,
          }}
        >
          <Avatar size="lg" color="primary" alt={user.email ?? undefined} />
          <View style={{ flex: 1 }}>
            <Text weight="semibold">{user.email}</Text>
            <Muted size={13}>
              {user.emailConfirmed ? 'E-posta doğrulandı' : 'E-posta doğrulanmadı'}
            </Muted>
          </View>
        </View>
      ) : (
        <View
          style={{
            gap: 14,
            padding: 20,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: color.canvas.border,
            backgroundColor: color.canvas.surfaceAlt,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color.primary.subtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Heart size={20} color={color.primary.subtleContrast} />
          </View>
          <Paragraph muted>
            Hesap oluştur; beğendiğin kahveleri alışveriş listene kaydet, sonra kolayca bul. Üye
            olmadan da mağazayı gezebilirsin.
          </Paragraph>
          <Button block onPress={() => router.push('/login')}>
            Giriş yap
          </Button>
          <Button block variant="outline" onPress={() => router.push('/register')}>
            Kayıt ol
          </Button>
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text weight="semibold">Görünüm</Text>
        <Segmented
          block
          accessibilityLabel="Tema"
          value={preference}
          onChange={(value) => setPreference(value as ThemePreference)}
          options={[
            { value: 'system', label: 'Sistem' },
            { value: 'light', label: 'Açık' },
            { value: 'dark', label: 'Koyu' },
          ]}
        />
      </View>

      {user ? (
        <Button variant="outline" onPress={() => void signOut()}>
          Çıkış yap
        </Button>
      ) : null}
    </View>
  );
}
