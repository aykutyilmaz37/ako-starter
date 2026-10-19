import { applyFieldErrors, isApiError } from '@ako/api-client';
import { useLogin } from '@ako/api-client/auth';
import { LoginBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Field, Input } from '@mari-ui/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthScreen } from '~/components/auth-screen';
import { useSession } from '~/lib/session';
import { s } from '~/lib/strings';

const Schema = LoginBody.pick({ email: true, password: true }).extend({ email: z.email() });
type Values = z.infer<typeof Schema>;

export default function LoginScreen() {
  const { verified } = useLocalSearchParams<{ verified?: string }>();
  const { signIn } = useSession();
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
        setMessage(isApiError(error) && error.status === 401 ? s.login.invalid : s.login.failed);
      },
    },
  });

  const submit = () => void form.handleSubmit((data) => login.mutate({ data }))();

  return (
    <AuthScreen title={s.login.title} description={s.login.description}>
      {verified ? <Alert color="success" description={s.login.verified} /> : null}
      {message ? <Alert color="error" description={message} /> : null}
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field label={s.email} required error={fieldState.error?.message}>
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
          <Field label={s.password} required error={fieldState.error?.message}>
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
        {s.login.submit}
      </Button>
      <Button variant="link" onPress={() => router.push('/register')}>
        {s.login.register}
      </Button>
    </AuthScreen>
  );
}
