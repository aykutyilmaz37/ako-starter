import { applyFieldErrors } from '@ako/api-client';
import { useRegister } from '@ako/api-client/auth';
import { RegisterBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Field, Input } from '@mari-ui/native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthScreen } from '~/components/auth-screen';
import { s } from '~/lib/strings';

// API şeması + istemci kuralları. Şifre kuralları API'de; hataları forma gelir.
const Schema = RegisterBody.extend({ email: z.email(), password: z.string().min(8) });
type Values = z.infer<typeof Schema>;

export default function RegisterScreen() {
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
    <AuthScreen title={s.register.title} description={s.register.description}>
      {ruleErrors.map((message) => (
        <Alert key={message} color="error" description={message} />
      ))}
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
          <Field
            label={s.password}
            required
            hint={s.passwordHint}
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
        {s.register.submit}
      </Button>
      <Button variant="link" onPress={() => router.replace('/login')}>
        {s.register.login}
      </Button>
    </AuthScreen>
  );
}
