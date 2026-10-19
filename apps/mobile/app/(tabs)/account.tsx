import { Avatar, Button, Paragraph, Segmented, Text, useTheme } from '@mari-ui/native';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Heading, Muted } from '~/components/ui';
import { RADIUS } from '~/lib/brand';
import { useI18n } from '~/lib/i18n';
import { useSession } from '~/lib/session';
import { useThemePreference, type ThemePreference } from '~/lib/theme-preference';

/** Hesap sekmesi: giriş isteğe bağlıdır; giriş yapılmamışsa davet, yapılmışsa profil ve çıkış. Tema ve dil burada. */
export default function Account() {
  const { color } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, lang, languages, setLanguage } = useI18n();
  const { user, signOut } = useSession();
  const { preference, setPreference } = useThemePreference();

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 20 }}>
      <View style={{ gap: 4 }}>
        <Eyebrow>{t('account.eyebrow')}</Eyebrow>
        <Heading size={32}>{user ? t('account.hello') : t('account.join')}</Heading>
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
              {user.emailConfirmed ? t('account.verified') : t('account.notVerified')}
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
          <Paragraph muted>{t('account.joinText')}</Paragraph>
          <Button block onPress={() => router.push('/login')}>
            {t('account.login')}
          </Button>
          <Button block variant="outline" onPress={() => router.push('/register')}>
            {t('account.register')}
          </Button>
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Text weight="semibold">{t('account.appearance')}</Text>
        <Segmented
          block
          accessibilityLabel={t('theme.label')}
          value={preference}
          onChange={(value) => setPreference(value as ThemePreference)}
          options={[
            { value: 'system', label: t('theme.system') },
            { value: 'light', label: t('theme.light') },
            { value: 'dark', label: t('theme.dark') },
          ]}
        />
      </View>

      {languages.length > 1 ? (
        <View style={{ gap: 8 }}>
          <Text weight="semibold">{t('account.language')}</Text>
          <Segmented
            block
            accessibilityLabel={t('account.language')}
            value={lang}
            onChange={(value) => setLanguage(String(value))}
            options={languages.map((l) => ({ value: l.code, label: l.name }))}
          />
        </View>
      ) : null}

      {user ? (
        <Button variant="outline" onPress={() => void signOut()}>
          {t('account.logout')}
        </Button>
      ) : null}
    </ScrollView>
  );
}
