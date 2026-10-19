import { sessionContext } from '@ako/web-core';
import { Alert } from '@mari-ui/components/alert';
import { Card } from '@mari-ui/components/card';
import { Paragraph, Title } from '@mari-ui/components/typography';
import { redirect, useSearchParams } from 'react-router';
import { LoginForm } from '~/features/auth/components/login-form';
import { AUTH_ERROR_MESSAGES } from '~/features/auth/error-messages';
import type { Route } from './+types/login';

export function meta() {
  return [{ title: 'Giriş | Akı Kahve Yönetim' }];
}

export function loader({ context }: Route.LoaderArgs) {
  return context.get(sessionContext) ? redirect('/') : null;
}

/** Yalnızca Admin rolündeki kullanıcılar girebilir; diğerleri "erişim yetkiniz yok" görür. */
export default function LoginPage() {
  const [params] = useSearchParams();
  const error = params.get('error');

  return (
    <Card className="w-full max-w-sm">
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <Title level={1} className="text-xl">
            Yönetim paneli
          </Title>
          <Paragraph className="text-sm text-mari-muted">Akı Kahve ekibi için</Paragraph>
        </div>
        {error && (
          <Alert color="error" description={AUTH_ERROR_MESSAGES[error] ?? 'Giriş yapılamadı.'} />
        )}
        <LoginForm onSuccess={() => window.location.assign('/')} />
      </div>
    </Card>
  );
}
