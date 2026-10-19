import { Avatar } from '@mari-ui/components/avatar';
import { Button } from '@mari-ui/components/button';
import { Sidebar } from '@mari-ui/components/menu';
import { Text } from '@mari-ui/components/typography';
import { LayoutDashboard, LogOut, Package, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { logout } from '~/shared/api';
import { useMe } from '~/shared/use-me';

/** Menü öğeleri. Yeni yönetim sayfaları buraya eklenir. */
const menu = [
  {
    key: 'dashboard',
    title: 'Genel bakış',
    route: '/',
    icon: <LayoutDashboard size={18} aria-hidden />,
  },
  {
    key: 'products',
    title: 'Ürünler',
    route: '/products',
    icon: <Package size={18} aria-hidden />,
  },
  { key: 'users', title: 'Müşteriler', route: '/users', icon: <Users size={18} aria-hidden /> },
];

/** mari-ui Sidebar (ikon şeridi, üzerine gelince açılır) + üst çubuk + içerik. Giriş sayfasında menü yok. */
export function AdminLayout({ children }: { children: ReactNode }) {
  const me = useMe();
  const location = useLocation();
  const navigate = useNavigate();

  if (!me) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mari-surface-alt px-4">
        {children}
      </main>
    );
  }

  const email = me.email ?? me.userName;

  return (
    <div className="flex min-h-screen bg-mari-surface-alt">
      <Sidebar
        variant="hover"
        label="Yönetim menüsü"
        data={menu}
        logo={<Text weight="semibold">Akı Kahve</Text>}
        logoHref="/"
        logoLabel="Genel bakış"
        currentPath={location.pathname}
        onNavigate={(route) => navigate(route)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-mari-border bg-mari-surface px-6">
          <Avatar size="sm" color="primary" src={email.slice(0, 2).toUpperCase()} alt={email} />
          <Text className="max-w-56 truncate text-sm">{email}</Text>
          <Button
            size="sm"
            variant="ghost"
            icon={<LogOut size={16} aria-hidden />}
            aria-label="Çıkış yap"
            onClick={() => logout()}
          />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
