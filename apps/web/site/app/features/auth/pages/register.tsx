import { Link, useNavigate } from 'react-router';
import { AuthLayout } from '../components/auth-layout';
import { RegisterForm } from '../components/register-form';

export function meta() {
  return [{ title: 'Hesap oluştur | Akı Kahve' }];
}

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Hesap oluşturun"
      description="Bir dakika sürer. E-postanıza 6 haneli bir doğrulama kodu göndereceğiz."
    >
      <RegisterForm
        onRegistered={(email) => navigate(`/verify?email=${encodeURIComponent(email)}`)}
      />
      <p className="text-sm text-mari-muted">
        Zaten hesabınız var mı?{' '}
        <Link to="/login" className="font-medium text-mari-primary">
          Giriş yapın
        </Link>
      </p>
    </AuthLayout>
  );
}
