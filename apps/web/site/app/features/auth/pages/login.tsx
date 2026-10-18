import { AUTH_ERROR_MESSAGES, LoginForm } from '@ako/ui';
import { sessionContext } from '@ako/web-core';
import { Alert } from '@mari-ui/components/alert';
import { Link, redirect, useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '../components/auth-layout';
import type { Route } from './+types/login';

export function meta() {
  return [{ title: 'Giriş yap | Akı Kahve' }];
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
    <AuthLayout
      title="Tekrar hoş geldiniz"
      description="Alışveriş listenize ulaşmak için giriş yapın."
    >
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
            <Link to="/forgot-password" className="text-mari-muted hover:text-mari-foreground">
              Şifremi unuttum
            </Link>
            <Link to="/register" className="font-medium text-mari-primary">
              Hesap oluştur
            </Link>
          </div>
        }
      />
    </AuthLayout>
  );
}
