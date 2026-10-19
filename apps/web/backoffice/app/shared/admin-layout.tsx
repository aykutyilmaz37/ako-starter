import { Avatar } from '@mari-ui/components/avatar';
import { Button } from '@mari-ui/components/button';
import { Sidebar } from '@mari-ui/components/menu';
import { Text } from '@mari-ui/components/typography';
import { Coffee, Languages, LayoutDashboard, LogOut, Package, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { logout } from '~/shared/api';
import { useT } from '~/shared/i18n/i18n-provider';
import { LanguageSwitcher } from '~/shared/language-switcher';
import { useMe } from '~/shared/use-me';

/** mari-ui Sidebar (ikon şeridi, üzerine gelince açılır) + üst çubuk + içerik. Giriş sayfasında menü yok. */
export function AdminLayout({ children }: { children: ReactNode }) {
  const me = useMe();
  const t = useT();
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

  // Menü öğeleri. Yeni yönetim sayfaları buraya eklenir.
  const menu = [
    {
      key: 'dashboard',
      title: t('layout.menu.dashboard'),
      route: '/',
      icon: <LayoutDashboard size={18} aria-hidden />,
    },
    {
      key: 'products',
      title: t('layout.menu.products'),
      route: '/products',
      icon: <Package size={18} aria-hidden />,
    },
    {
      key: 'users',
      title: t('layout.menu.users'),
      route: '/users',
      icon: <Users size={18} aria-hidden />,
    },
    {
      key: 'translations',
      title: t('layout.menu.translations'),
      route: '/translations',
      icon: <Languages size={18} aria-hidden />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-mari-surface-alt">
      <Sidebar
        variant="hover"
        label={t('layout.menu.label')}
        data={menu}
        // Kapalı ikon şeridine sığsın diye logo yalnız işaret; erişilebilir adı logoLabel'dan.
        logo={
          <span className="flex size-8 items-center justify-center rounded-mari-md bg-mari-primary-solid text-mari-primary-solid-contrast">
            <Coffee size={18} aria-hidden />
          </span>
        }
        logoHref="/"
        logoLabel={t('layout.homeLabel')}
        currentPath={location.pathname}
        onNavigate={(route) => navigate(route)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-mari-border bg-mari-surface px-6">
          <LanguageSwitcher />
          <Avatar size="sm" color="primary" alt={email} />
          <Text className="max-w-56 truncate text-sm">{email}</Text>
          <Button
            size="sm"
            variant="ghost"
            icon={<LogOut size={16} aria-hidden />}
            aria-label={t('layout.logout')}
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
