import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '~/features/auth/components/auth-layout';
import { VerifyEmailForm } from '~/features/auth/components/verify-email-form';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useLocalePath, useT } from '~/shared/i18n/i18n-provider';
import type { Route } from './+types/verify';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('auth.verify.meta') }];
}

/** Kayıttan sonra ya da doğrulanmamış hesapla girişte (?resend=1) gelinir. */
export default function VerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();
  const localePath = useLocalePath();

  return (
    <AuthLayout title={t('auth.verify.title')}>
      <VerifyEmailForm
        email={params.get('email') ?? ''}
        sendOnMount={params.has('resend')}
        onVerified={() => navigate(localePath('/login?verified=1'))}
      />
    </AuthLayout>
  );
}
