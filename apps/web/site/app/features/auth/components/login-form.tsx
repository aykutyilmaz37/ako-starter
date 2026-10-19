import { applyFieldErrors, isApiError } from '@ako/api-client';
import { useGetAuthProviders, useLogin } from '@ako/api-client/auth';
import { LoginBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { Field } from '@mari-ui/components/field';
import { Input } from '@mari-ui/components/input';
import { useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AUTH_ERROR_KEYS } from '~/features/auth/error-messages';
import { useT } from '~/shared/i18n/i18n-provider';

const Schema = LoginBody.pick({ email: true, password: true }).extend({ email: z.email() });
type Values = z.infer<typeof Schema>;

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
  github: 'GitHub',
  x: 'X',
  linkedin: 'LinkedIn',
};

interface LoginFormProps {
  /** Başarılı girişten sonra (oturum çerezi yazıldı). */
  onSuccess: () => void;
  /** Doğrulanmamış e-posta ile giriş denenince (Identity "NotAllowed" döner). */
  onEmailNotConfirmed: (email: string) => void;
  footer?: ReactNode;
}

/** E-posta + şifre girişi ve (ayarı dolu sağlayıcılar için) sosyal giriş butonları. */
export function LoginForm({ onSuccess, onEmailNotConfirmed, footer }: LoginFormProps) {
  const t = useT();
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  });
  const providers = useGetAuthProviders();

  const login = useLogin({
    mutation: {
      onSuccess,
      onError: (error, { data }) => {
        if (isApiError(error) && error.status === 401 && error.message === 'NotAllowed') {
          onEmailNotConfirmed(data.email);
          return;
        }
        if (applyFieldErrors(error, form.setError)) return;
        const errorKey = isApiError(error) && error.code ? AUTH_ERROR_KEYS[error.code] : undefined;
        setMessage(
          isApiError(error) && error.status === 401
            ? t('auth.login.invalid')
            : t(errorKey ?? 'auth.login.failed'),
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
        {t('auth.login.submit')}
      </Button>

      {(providers.data?.external.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2">
          {providers.data!.external.map((provider) => (
            // Tam sayfa yönlendirme: OAuth akışı BFF → API → sağlayıcı → geri.
            <Button key={provider} href={`/bff/external/${provider}`} variant="outline" block>
              {t('auth.login.social', { provider: PROVIDER_LABELS[provider] ?? provider })}
            </Button>
          ))}
        </div>
      )}

      {footer}
    </form>
  );
}
