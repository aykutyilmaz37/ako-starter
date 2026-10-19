import { sessionContext } from '@ako/web-core';
import { Alert } from '@mari-ui/components/alert';
import { Card } from '@mari-ui/components/card';
import { Paragraph, Title } from '@mari-ui/components/typography';
import { redirect, useSearchParams } from 'react-router';
import { LoginForm } from '~/features/auth/components/login-form';
import { AUTH_ERROR_KEYS } from '~/features/auth/error-messages';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import type { Route } from './+types/login';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('auth.meta') }];
}

export function loader({ context }: Route.LoaderArgs) {
  return context.get(sessionContext) ? redirect('/') : null;
}

/** Yalnızca Admin rolündeki kullanıcılar girebilir; diğerleri "erişim yetkiniz yok" görür. */
export default function LoginPage() {
  const [params] = useSearchParams();
  const t = useT();
  const error = params.get('error');

  return (
    <Card className="w-full max-w-sm">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <Title level={1} className="text-xl">
            {t('auth.title')}
          </Title>
          <Paragraph className="text-sm text-mari-muted">{t('auth.subtitle')}</Paragraph>
        </div>
        {error && <Alert color="error" description={t(AUTH_ERROR_KEYS[error] ?? 'auth.failed')} />}
        <LoginForm onSuccess={() => window.location.assign('/')} />
      </div>
    </Card>
  );
}
