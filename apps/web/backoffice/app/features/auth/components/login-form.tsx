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
import { AUTH_ERROR_KEYS } from '~/features/auth/error-messages';
import { useT } from '~/shared/i18n/i18n-provider';

const Schema = LoginBody.pick({ email: true, password: true }).extend({ email: z.email() });
type Values = z.infer<typeof Schema>;

/** Yönetim paneli girişi: yalnızca e-posta + şifre. Admin olmayan kullanıcıyı BFF reddeder (403). */
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useT();
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
        const errorKey = isApiError(error) && error.code ? AUTH_ERROR_KEYS[error.code] : undefined;
        setMessage(
          isApiError(error) && error.status === 401
            ? t('auth.invalid')
            : t(errorKey ?? 'auth.failed'),
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
          <Field label={t('auth.email')} required error={fieldState.error?.message}>
            <Input {...field} type="email" autoComplete="email" />
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field label={t('auth.password')} required error={fieldState.error?.message}>
            <Input {...field} type="password" autoComplete="current-password" visibilityToggle />
          </Field>
        )}
      />
      <Button htmlType="submit" color="primary" block loading={login.isPending}>
        {t('auth.submit')}
      </Button>
    </form>
  );
}
