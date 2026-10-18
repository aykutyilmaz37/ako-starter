import { logout } from '@ako/ui';
import { Button } from '@mari-ui/components/button';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useMe } from './use-me';

const links = [
  { to: '/', label: 'Kullanıcılar' },
  { to: '/products', label: 'Ürünler' },
];

/** Sol menü + içerik. Giriş sayfasında menü gösterilmez. Yeni yönetim sayfaları menüye buradan eklenir. */
export function AdminLayout({ children }: { children: ReactNode }) {
  const me = useMe();

  if (!me) {
    return <main className="mx-auto max-w-sm px-4 py-16">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col gap-1 border-r border-mari-border p-4">
        <span className="mb-4 font-semibold">Ako Backoffice</span>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `rounded px-3 py-2 ${isActive ? 'bg-mari-primary/10 font-medium' : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <span className="mt-auto truncate text-sm text-mari-muted">{me.email}</span>
        <Button size="sm" variant="ghost" onClick={() => logout('/login')}>
          Çıkış
        </Button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
