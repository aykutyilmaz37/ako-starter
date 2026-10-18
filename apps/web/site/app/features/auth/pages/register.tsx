import { Card } from '@mari-ui/components/card';
import { Link, useNavigate } from 'react-router';
import { RegisterForm } from '../components/register-form';

export function meta() {
  return [{ title: 'Hesap oluştur | Ako' }];
}

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Card title="Hesap oluştur" className="mx-auto max-w-sm">
      <div className="flex flex-col gap-4">
        <RegisterForm
          onRegistered={(email) => navigate(`/verify?email=${encodeURIComponent(email)}`)}
        />
        <Link to="/login" className="text-sm">
          Zaten hesabım var
        </Link>
      </div>
    </Card>
  );
}
