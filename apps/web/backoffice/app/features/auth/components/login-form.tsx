import { applyFieldErrors, isApiError } from '@ako/api-client';
import { useLogin } from '@ako/api-client/auth';
import { LoginBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { Field } from '@mari-ui/components/field';
import { Input } from '@mari-ui/components/input';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AUTH_ERROR_MESSAGES } from '~/features/auth/error-messages';

const Schema = LoginBody.pick({ email: true, password: true }).extend({ email: z.email() });
type Values = z.infer<typeof Schema>;

/** Yönetim paneli girişi: yalnızca e-posta + şifre. Admin olmayan kullanıcıyı BFF reddeder (403). */
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  });
  const login = useLogin({
    mutation: {
      onSuccess,
      onError: (error) => {
        if (applyFieldErrors(error, form.setError)) return;
        setMessage(
          isApiError(error) && error.status === 401
            ? 'E-posta ya da şifre hatalı.'
            : (isApiError(error) && error.code && AUTH_ERROR_MESSAGES[error.code]) ||
                'Giriş yapılamadı.',
        );
      },
    },
  });

  return (
    <form
      method="post"
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((data) => login.mutate({ data }))}
      noValidate
    >
      {message && <Alert color="error" description={message} />}
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field label="E-posta" required error={fieldState.error?.message}>
            <Input {...field} type="email" autoComplete="email" />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field label="Şifre" required error={fieldState.error?.message}>
            <Input {...field} type="password" autoComplete="current-password" visibilityToggle />
          </Field>
        )}
      />
      <Button htmlType="submit" color="primary" block loading={login.isPending}>
        Giriş yap
      </Button>
    </form>
  );
}
