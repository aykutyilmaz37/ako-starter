import { Card } from '@mari-ui/components/card';
import { useNavigate } from 'react-router';
import { ForgotPasswordForm } from '../components/forgot-password-form';

export function meta() {
  return [{ title: 'Şifremi unuttum | Ako' }];
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <Card title="Şifremi unuttum" className="mx-auto max-w-sm">
      <ForgotPasswordForm onReset={() => navigate('/login?reset=1')} />
    </Card>
  );
}
