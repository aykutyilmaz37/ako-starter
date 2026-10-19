import { Paragraph, useTheme } from '@mari-ui/native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Heading } from '~/components/ui';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Giriş akışı ekranlarının ortak iskeleti: başlık, açıklama, klavye dostu kaydırma. */
export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { color } = useTheme();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          gap: 16,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ width: 44, height: 44, justifyContent: 'center' }}
        >
          <ArrowLeft size={22} color={color.canvas.foreground} />
        </Pressable>
        <View style={{ gap: 8 }}>
          <Heading size={32}>{title}</Heading>
          {description ? <Paragraph>{description}</Paragraph> : null}
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
