import { logout } from '@ako/ui';
import { Avatar } from '@mari-ui/components/avatar';
import { Button } from '@mari-ui/components/button';
import { LayoutDashboard, LogOut, Package, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { useMe } from './use-me';

const links = [
  { to: '/', label: 'Genel bakış', icon: LayoutDashboard },
  { to: '/products', label: 'Ürünler', icon: Package },
  { to: '/users', label: 'Müşteriler', icon: Users },
];

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

/** Sol menü + içerik. Giriş sayfasında menü gösterilmez. Yeni yönetim sayfaları menüye buradan eklenir. */
export function AdminLayout({ children }: { children: ReactNode }) {
  const me = useMe();

  if (!me) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mari-surface-alt px-4">
        {children}
      </main>
    );
  }

  const email = me.email ?? me.userName;

  return (
    <div className="flex min-h-screen flex-col bg-mari-surface-alt md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-mari-border bg-mari-surface md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4 md:py-6">
          <span className="flex size-8 items-center justify-center rounded-mari-md bg-mari-primary-solid text-sm font-bold text-mari-primary-solid-contrast">
            A
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Akı Kahve</p>
            <p className="text-xs text-mari-muted">Yönetim paneli</p>
          </div>
        </div>

        <nav
          aria-label="Yönetim menüsü"
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0"
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-mari-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-mari-primary-subtle font-medium text-mari-primary-subtle-contrast'
                    : 'text-mari-muted hover:bg-mari-surface-alt hover:text-mari-foreground'
                }`
              }
            >
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden items-center gap-3 border-t border-mari-border p-4 md:flex">
          <Avatar size="sm" color="primary" src={initials(email)} alt={email} />
          <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
          <Button
            size="sm"
            variant="ghost"
            icon={<LogOut size={16} aria-hidden />}
            aria-label="Çıkış yap"
            onClick={() => logout('/login')}
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
