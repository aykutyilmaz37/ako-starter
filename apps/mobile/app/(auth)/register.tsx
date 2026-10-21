import { applyFieldErrors } from '@ako/api-client';
import { useRegister } from '@ako/api-client/auth';
import { RegisterBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mari-ui/native/alert';
import { Button } from '@mari-ui/native/button';
import { Field } from '@mari-ui/native/field';
import { Input } from '@mari-ui/native/input';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthScreen } from '~/features/auth/components/auth-screen';
import { useT } from '~/features/localization/i18n';

// API şeması + istemci kuralları. Şifre kuralları API'de; hataları forma gelir.
const Schema = RegisterBody.extend({ email: z.email(), password: z.string().min(8) });
type Values = z.infer<typeof Schema>;

export default function RegisterScreen() {
  const t = useT();
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  });
  const register = useRegister({
    mutation: {
      onSuccess: (_, { data }) =>
        router.replace({ pathname: '/verify', params: { email: data.email } }),
      onError: (error) => applyFieldErrors(error, form.setError),
    },
  });

  // Identity'nin şifre hataları alan adıyla değil kodla döner (PasswordTooShort…); formun üstünde gösterilir.
  const ruleErrors = Object.entries(register.error?.fieldErrors ?? {})
    .filter(([key]) => key !== 'email' && key !== 'password')
    .flatMap(([, messages]) => messages);

  const submit = () => void form.handleSubmit((data) => register.mutate({ data }))();

  return (
    <AuthScreen title={t('auth.register.title')} description={t('auth.register.description')}>
      {ruleErrors.map((message) => (
        <Alert key={message} color="error" description={message} />
      ))}
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
          <Field
            label={t('auth.password')}
            required
            hint={t('auth.passwordHint')}
            error={fieldState.error?.message}
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          </Field>
        )}
      />
      <Button block loading={register.isPending} onPress={submit}>
        {t('auth.register.submit')}
      </Button>
      <Button variant="link" onPress={() => router.replace('/login')}>
        {t('auth.register.login')}
      </Button>
    </AuthScreen>
  );
}
