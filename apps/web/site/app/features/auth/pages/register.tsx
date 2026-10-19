import { useNavigate } from 'react-router';
import { AuthLayout } from '~/features/auth/components/auth-layout';
import { RegisterForm } from '~/features/auth/components/register-form';
import { metaTranslator } from '~/shared/i18n/i18n';
import { LocaleLink, useLocalePath, useT } from '~/shared/i18n/i18n-provider';
import type { Route } from './+types/register';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('auth.register.meta') }];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const t = useT();
  const localePath = useLocalePath();

  return (
    <AuthLayout title={t('auth.register.title')} description={t('auth.register.description')}>
      <RegisterForm
        onRegistered={(email) => navigate(localePath(`/verify?email=${encodeURIComponent(email)}`))}
      />
      <p className="text-sm text-mari-muted">
        {t('auth.register.haveAccount')}{' '}
        <LocaleLink to="/login" className="font-medium text-mari-primary">
          {t('auth.register.loginLink')}
        </LocaleLink>
      </p>
    </AuthLayout>
  );
}
