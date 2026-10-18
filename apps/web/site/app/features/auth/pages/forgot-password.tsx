import { Link, useNavigate } from 'react-router';
import { AuthLayout } from '../components/auth-layout';
import { ForgotPasswordForm } from '../components/forgot-password-form';

export function meta() {
  return [{ title: 'Şifremi unuttum | Akı Kahve' }];
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Şifrenizi sıfırlayın"
      description="E-postanıza 6 haneli bir kod göndereceğiz."
    >
      <ForgotPasswordForm onReset={() => navigate('/login?reset=1')} />
      <Link to="/login" className="text-sm text-mari-muted hover:text-mari-foreground">
        Girişe dön
      </Link>
    </AuthLayout>
  );
}
