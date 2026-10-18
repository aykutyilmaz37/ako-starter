import { logout } from '@ako/ui';
import { Button } from '@mari-ui/components/button';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useMe } from './use-me';

/** Başlık + menü + sayfa içeriği. Menüye yeni özellik eklendikçe buraya bağlantı eklenir. */
export function SiteLayout({ children }: { children: ReactNode }) {
  const me = useMe();

  return (
    <>
      <header className="border-b border-mari-border">
        <nav className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <NavLink to="/" className="font-semibold">
            Ako
          </NavLink>
          <NavLink to="/">Ürünler</NavLink>
          {me && <NavLink to="/todos">Görevlerim</NavLink>}
          <span className="ml-auto" />
          {me ? (
            <>
              <span className="text-sm text-mari-muted">{me.email ?? me.userName}</span>
              <Button size="sm" variant="ghost" onClick={() => logout('/')}>
                Çıkış
              </Button>
            </>
          ) : (
            <Button size="sm" href="/login">
              Giriş yap
            </Button>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
