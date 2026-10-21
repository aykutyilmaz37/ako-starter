import { LoginForm } from '~/features/auth/components/login-form';
import { AUTH_ERROR_KEYS } from '~/features/auth/error-messages';
import { getMe } from '@ako/api-client/auth';
import { sessionContext } from '@ako/web-core';
import { Alert } from '@mari-ui/components/alert';
import { redirect, useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '~/features/auth/components/auth-layout';
import { apiInit } from '~/shared/i18n/api-init.server';
import { localizePath, metaTranslator } from '~/shared/i18n/i18n';
import { LocaleLink, useLocalePath, useT } from '~/shared/i18n/i18n-provider';
import { languageContext } from '~/shared/i18n/language-context';
import type { Route } from './+types/login';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('auth.login.meta') }];
}

/**
 * Girişli kullanıcı ana sayfaya gider. Karar çerezin varlığına değil /me'ye bakar: çerez var ama
 * geçersizse (kullanıcı API'de silindi) giriş sayfası açık kalmalı, yoksa kullanıcı giriş yapamaz.
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  if (!context.get(sessionContext)) return null;
  const me = await getMe(apiInit(context, request)).catch(() => null);
  const { lang, defaultLang } = context.get(languageContext);
  return me ? redirect(localizePath('/', lang, defaultLang)) : null;
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();
  const localePath = useLocalePath();
  const error = params.get('error'); // sosyal girişten dönen hata kodu
  const notice = params.has('verified')
    ? t('auth.login.verified')
    : params.has('reset')
      ? t('auth.login.resetDone')
      : null;

  return (
    <AuthLayout title={t('auth.login.title')} description={t('auth.login.description')}>
      {error && (
        <Alert color="error" description={t(AUTH_ERROR_KEYS[error] ?? 'auth.login.failed')} />
      )}
      {notice && <Alert color="success" description={notice} />}
      <LoginForm
        // Oturum değişti: sayfa tamamen yenilensin ki başlık ve sunucu verileri yeni oturumla gelsin.
        onSuccess={() => window.location.assign(localePath('/'))}
        onEmailNotConfirmed={(email) =>
          navigate(localePath(`/verify?email=${encodeURIComponent(email)}&resend=1`))
        }
        footer={
          <div className="flex justify-between text-sm">
            <LocaleLink
              to="/forgot-password"
              className="text-mari-muted hover:text-mari-foreground"
            >
              {t('auth.login.forgot')}
            </LocaleLink>
            <LocaleLink to="/register" className="font-medium text-mari-primary">
              {t('auth.login.register')}
            </LocaleLink>
          </div>
        }
      />
    </AuthLayout>
  );
}
