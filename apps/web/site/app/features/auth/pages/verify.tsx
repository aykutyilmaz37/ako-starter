import { Card } from '@mari-ui/components/card';
import { useNavigate, useSearchParams } from 'react-router';
import { VerifyEmailForm } from '../components/verify-email-form';

export function meta() {
  return [{ title: 'E-posta doğrulama | Ako' }];
}

/** Kayıttan sonra ya da doğrulanmamış hesapla girişte (?resend=1) gelinir. */
export default function VerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  return (
    <Card title="E-postanızı doğrulayın" className="mx-auto max-w-sm">
      <VerifyEmailForm
        email={params.get('email') ?? ''}
        sendOnMount={params.has('resend')}
        onVerified={() => navigate('/login?verified=1')}
      />
    </Card>
  );
}
