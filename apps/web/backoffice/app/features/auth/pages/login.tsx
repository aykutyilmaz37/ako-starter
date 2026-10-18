import { AUTH_ERROR_MESSAGES, LoginForm } from '@ako/ui';
import { Alert } from '@mari-ui/components/alert';
import { Card } from '@mari-ui/components/card';
import { sessionContext } from '@ako/web-core';
import { redirect, useSearchParams } from 'react-router';
import type { Route } from './+types/login';

export function meta() {
  return [{ title: 'Giriş | Ako Backoffice' }];
}

export function loader({ context }: Route.LoaderArgs) {
  return context.get(sessionContext) ? redirect('/') : null;
}

/** Yalnızca Admin rolündeki kullanıcılar girebilir; diğerleri "erişim yetkiniz yok" görür. */
export default function LoginPage() {
  const [params] = useSearchParams();
  const error = params.get('error');

  return (
    <Card title="Backoffice girişi">
      <div className="flex flex-col gap-4">
        {error && (
          <Alert color="error" description={AUTH_ERROR_MESSAGES[error] ?? 'Giriş yapılamadı.'} />
        )}
        <LoginForm onSuccess={() => window.location.assign('/')} />
      </div>
    </Card>
  );
}
