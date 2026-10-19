import { useNavigate } from 'react-router';
import { AuthLayout } from '~/features/auth/components/auth-layout';
import { ForgotPasswordForm } from '~/features/auth/components/forgot-password-form';
import { metaTranslator } from '~/shared/i18n/i18n';
import { LocaleLink, useLocalePath, useT } from '~/shared/i18n/i18n-provider';
import type { Route } from './+types/forgot-password';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('auth.forgot.meta') }];
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const t = useT();
  const localePath = useLocalePath();

  return (
    <AuthLayout title={t('auth.forgot.title')} description={t('auth.forgot.description')}>
      <ForgotPasswordForm onReset={() => navigate(localePath('/login?reset=1'))} />
      <LocaleLink to="/login" className="text-sm text-mari-muted hover:text-mari-foreground">
        {t('auth.forgot.back')}
      </LocaleLink>
    </AuthLayout>
  );
}
