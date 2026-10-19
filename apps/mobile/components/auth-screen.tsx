import { Paragraph, Title } from '@mari-ui/native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
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
        <View style={{ gap: 8 }}>
          <Title>{title}</Title>
          {description ? <Paragraph>{description}</Paragraph> : null}
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
