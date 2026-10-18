import { AUTH_ERROR_MESSAGES, LoginForm } from '@ako/ui';
import { sessionContext } from '@ako/web-core';
import { Alert } from '@mari-ui/components/alert';
import { redirect, useSearchParams } from 'react-router';
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
    <div className="w-full max-w-sm rounded-mari-lg border border-mari-border bg-mari-surface p-8 shadow-mari-sm">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-mari-md bg-mari-primary-solid text-lg font-bold text-mari-primary-solid-contrast">
          A
        </span>
        <div>
          <h1 className="text-xl font-semibold">Yönetim paneli</h1>
          <p className="mt-1 text-sm text-mari-muted">Akı Kahve ekibi için</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {error && (
          <Alert color="error" description={AUTH_ERROR_MESSAGES[error] ?? 'Giriş yapılamadı.'} />
        )}
        <LoginForm onSuccess={() => window.location.assign('/')} />
      </div>
    </div>
  );
}
