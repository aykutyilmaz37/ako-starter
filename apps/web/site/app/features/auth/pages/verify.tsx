import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '~/features/auth/components/auth-layout';
import { VerifyEmailForm } from '~/features/auth/components/verify-email-form';

export function meta() {
  return [{ title: 'E-posta doğrulama | Akı Kahve' }];
}

/** Kayıttan sonra ya da doğrulanmamış hesapla girişte (?resend=1) gelinir. */
export default function VerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  return (
    <AuthLayout title="E-postanızı doğrulayın">
      <VerifyEmailForm
        email={params.get('email') ?? ''}
        sendOnMount={params.has('resend')}
        onVerified={() => navigate('/login?verified=1')}
      />
    </AuthLayout>
  );
}
