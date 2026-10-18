import type { ReactNode } from 'react';

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
        <p className="text-sm font-semibold tracking-widest opacity-80">AKI KAHVE</p>
        <div>
          <p className="font-heading text-3xl leading-snug">
            Beğendiğiniz kahveleri listenize ekleyin, yeni hasat geldiğinde ilk siz haberdar olun.
          </p>
          <p className="mt-6 text-sm opacity-80">Moda, İstanbul · 2019'dan beri</p>
        </div>
      </aside>

      <section className="mx-auto flex w-full max-w-sm flex-col justify-center gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold">{title}</h1>
          {description && <p className="text-mari-muted">{description}</p>}
        </header>
        {children}
      </section>
    </div>
  );
}
