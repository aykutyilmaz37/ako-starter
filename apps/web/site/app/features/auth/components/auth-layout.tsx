import { Paragraph, Text, Title } from '@mari-ui/components/typography';
import type { ReactNode } from 'react';
import { useT } from '~/shared/i18n/i18n-provider';

interface AuthLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/**
 * Giriş, kayıt, doğrulama ve şifre sıfırlama sayfalarının ortak düzeni: solda marka paneli, sağda form.
 * Dar ekranda marka paneli gizlenir, form tek başına kalır.
 */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  const t = useT();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
      <aside className="relative hidden overflow-hidden rounded-mari-xl bg-mari-primary-solid p-10 text-mari-primary-solid-contrast md:flex md:flex-col md:justify-between">
        <svg
          viewBox="0 0 200 200"
          className="absolute -right-16 -top-16 size-72 opacity-10"
          aria-hidden="true"
        >
          <ellipse
            cx="100"
            cy="100"
            rx="60"
            ry="90"
            transform="rotate(-30 100 100)"
            fill="currentColor"
          />
        </svg>
        <Text weight="semibold" className="text-sm tracking-widest text-inherit opacity-80">
          {t('auth.panel.brand')}
        </Text>
        <div>
          <Title level={2} className="text-3xl font-normal leading-snug text-inherit">
            {t('auth.panel.quote')}
          </Title>
          <Text className="mt-6 block text-sm text-inherit opacity-80">
            {t('auth.panel.place')}
          </Text>
        </div>
      </aside>

      <section className="mx-auto flex w-full max-w-sm flex-col justify-center gap-6">
        <header className="flex flex-col gap-2">
          <Title level={1} className="text-3xl">
            {title}
          </Title>
          {description && <Paragraph className="text-mari-muted">{description}</Paragraph>}
        </header>
        {children}
      </section>
    </div>
  );
}
