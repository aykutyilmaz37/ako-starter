import { applyFieldErrors, isApiError } from '@ako/api-client';
// ako:begin social
import { useGetAuthProviders, useLogin } from '@ako/api-client/auth';
// ako:else social
//~ import { useLogin } from '@ako/api-client/auth';
// ako:end social
import { LoginBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
// ako:begin social
import { Alert } from '@mari-ui/native/alert';
import { Button } from '@mari-ui/native/button';
import { Field } from '@mari-ui/native/field';
import { Input } from '@mari-ui/native/input';
import { Text } from '@mari-ui/native/typography';
// ako:else social
//~ import { Alert } from '@mari-ui/native/alert';
//~ import { Button } from '@mari-ui/native/button';
//~ import { Field } from '@mari-ui/native/field';
//~ import { Input } from '@mari-ui/native/input';
// ako:end social
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, View } from 'react-native'; // ako:social
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthScreen } from '~/features/auth/components/auth-screen';
import { SocialButton } from '~/features/auth/components/social-button'; // ako:social
import { useSession } from '~/features/auth/session';
import { useT } from '~/features/localization/i18n';
import { PROVIDER_LABELS, nativeSupported, useSocialLogin } from '~/features/auth/social-login'; // ako:social

const Schema = LoginBody.pick({ email: true, password: true }).extend({ email: z.email() });
type Values = z.infer<typeof Schema>;

export default function LoginScreen() {
  const { verified } = useLocalSearchParams<{ verified?: string }>();
  const { signIn } = useSession();
  const t = useT();
  const providers = useGetAuthProviders(); // ako:social
  const social = useSocialLogin(); // ako:social
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  });

  const login = useLogin({
    mutation: {
      onSuccess: (tokens) => signIn(tokens),
      onError: (error, { data }) => {
        // Doğrulanmamış e-posta (Identity "NotAllowed"): koda yönlendir, yeni kod gönderilsin.
        if (isApiError(error) && error.status === 401 && error.message === 'NotAllowed') {
          router.push({ pathname: '/verify', params: { email: data.email, resend: '1' } });
          return;
        }
        if (applyFieldErrors(error, form.setError)) return;
        setMessage(
          isApiError(error) && error.status === 401
            ? t('auth.login.invalid')
            : t('auth.login.failed'),
        );
      },
    },
  });

  const submit = () => void form.handleSubmit((data) => login.mutate({ data }))();

  return (
    <AuthScreen title={t('auth.login.title')} description={t('auth.login.description')}>
      {verified ? <Alert color="success" description={t('auth.login.verified')} /> : null}
      {message ? <Alert color="error" description={message} /> : null}
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field label={t('auth.email')} required error={fieldState.error?.message}>
            <Input
              type="email"
              autoComplete="email"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field label={t('auth.password')} required error={fieldState.error?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onPressEnter={submit}
            />
          </Field>
        )}
      />
      <Button block loading={login.isPending} onPress={submit}>
        {t('auth.login.submit')}
      </Button>
      {/* ako:begin social */}
      {(providers.data?.external.length ?? 0) > 0 ? (
        <View style={{ gap: 10 }}>
          <Text muted style={{ textAlign: 'center' }}>
            {t('auth.login.or')}
          </Text>
          {social.error ? <Alert color="error" description={t(social.error)} /> : null}
          {providers.data!.external.map((provider) => {
            // Apple yerel girişi yalnız iOS'ta; ikisi de API'de açıksa yerel, değilse tarayıcı akışı.
            const useNative =
              providers.data!.native.includes(provider) &&
              nativeSupported(provider) &&
              !(provider === 'apple' && Platform.OS !== 'ios');
            return (
              <SocialButton
                key={provider}
                provider={provider}
                label={t('auth.login.social', { provider: PROVIDER_LABELS[provider] ?? provider })}
                loading={social.pending === provider}
                disabled={social.pending !== null}
                onPress={() =>
                  void (useNative
                    ? social.native(provider as 'apple' | 'google')
                    : social.browser(provider))
                }
              />
            );
          })}
        </View>
      ) : null}
      {/* ako:end social */}
      <Button variant="link" onPress={() => router.push('/register')}>
        {t('auth.login.register')}
      </Button>
    </AuthScreen>
  );
}
