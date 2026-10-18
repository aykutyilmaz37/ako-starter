import { AUTH_ERROR_MESSAGES, LoginForm } from '@ako/ui';
import { Alert } from '@mari-ui/components/alert';
import { Card } from '@mari-ui/components/card';
import { sessionContext } from '@ako/web-core';
import { Link, redirect, useNavigate, useSearchParams } from 'react-router';
import type { Route } from './+types/login';

export function meta() {
  return [{ title: 'Giriş | Ako' }];
}

export function loader({ context }: Route.LoaderArgs) {
  return context.get(sessionContext) ? redirect('/') : null;
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const error = params.get('error'); // sosyal girişten dönen hata kodu
  const notice = params.has('verified')
    ? 'E-postanız doğrulandı, giriş yapabilirsiniz.'
    : params.has('reset')
      ? 'Şifreniz değişti, yeni şifrenizle giriş yapın.'
      : null;

  return (
    <Card title="Giriş yap" className="mx-auto max-w-sm">
      <div className="flex flex-col gap-4">
        {error && (
          <Alert color="error" description={AUTH_ERROR_MESSAGES[error] ?? 'Giriş yapılamadı.'} />
        )}
        {notice && <Alert color="success" description={notice} />}
        <LoginForm
          // Oturum değişti: sayfa tamamen yenilensin ki başlık ve sunucu verileri yeni oturumla gelsin.
          onSuccess={() => window.location.assign('/')}
          onEmailNotConfirmed={(email) =>
            navigate(`/verify?email=${encodeURIComponent(email)}&resend=1`)
          }
          footer={
            <div className="flex justify-between text-sm">
              <Link to="/register">Hesap oluştur</Link>
              <Link to="/forgot-password">Şifremi unuttum</Link>
            </div>
          }
        />
      </div>
    </Card>
  );
}
