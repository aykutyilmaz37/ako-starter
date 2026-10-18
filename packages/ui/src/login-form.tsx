import { applyFieldErrors, isApiError } from '@ako/api-client';
import { useGetAuthProviders, useLogin } from '@ako/api-client/auth';
import { LoginBody } from '@ako/api-client/zod/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mari-ui/components/alert';
import { Button } from '@mari-ui/components/button';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TextField } from './form';

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

// Sosyal girişte ve BFF'te dönen hata kodlarının kullanıcıya gösterilen karşılığı.
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth.email_in_use':
    'Bu e-posta ile kayıtlı bir hesap var. Önce e-posta ve şifrenizle giriş yapın.',
  'auth.external_failed': 'Sosyal giriş tamamlanamadı.',
  'auth.provider_unavailable': 'Bu giriş yöntemi etkin değil.',
  'auth.role_required': 'Bu uygulamaya erişim yetkiniz yok.',
};

interface LoginFormProps {
  /** Başarılı girişten sonra (oturum çerezi yazıldı). */
  onSuccess: () => void;
  /** Doğrulanmamış e-posta ile giriş denenince (Identity "NotAllowed" döner). */
  onEmailNotConfirmed?: (email: string) => void;
  /** Sosyal giriş butonları gösterilsin mi? */
  social?: boolean;
  /** Form altındaki bağlantılar (kayıt ol, şifremi unuttum…). */
  footer?: ReactNode;
}

/** E-posta + şifre girişi ve (ayarlı sağlayıcılar için) sosyal giriş butonları. Site ve backoffice ortak. */
export function LoginForm({
  onSuccess,
  onEmailNotConfirmed,
  social = true,
  footer,
}: LoginFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '' },
  });
  const providers = useGetAuthProviders({ query: { enabled: social } });

  const login = useLogin({
    mutation: {
      onSuccess,
      onError: (error, { data }) => {
        if (
          isApiError(error) &&
          error.status === 401 &&
          error.message === 'NotAllowed' &&
          onEmailNotConfirmed
        ) {
          onEmailNotConfirmed(data.email);
          return;
        }
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
      <TextField
        control={form.control}
        name="email"
        label="E-posta"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        control={form.control}
        name="password"
        label="Şifre"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button htmlType="submit" color="primary" block loading={login.isPending}>
        Giriş yap
      </Button>

      {social && (providers.data?.external.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2">
          {providers.data!.external.map((provider) => (
            // Tam sayfa yönlendirme: OAuth akışı BFF → API → sağlayıcı → geri.
            <Button key={provider} href={`/bff/external/${provider}`} variant="outline" block>
              {PROVIDER_LABELS[provider] ?? provider} ile devam et
            </Button>
          ))}
        </div>
      )}

      {footer}
    </form>
  );
}

/** Çıkış: BFF çerezi siler; sayfa yenilenince oturum yok. */
export async function logout(redirectTo = '/') {
  await fetch('/bff/logout', { method: 'POST' });
  window.location.assign(redirectTo);
}
