import { Button } from '@mari-ui/components/button';
import { BasicMenu } from '@mari-ui/components/menu';
import { Text } from '@mari-ui/components/typography';
import { ListChecks, LogOut, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { logout } from '~/shared/api';
import { LocaleLink, useLocalePath, useT } from '~/shared/i18n/i18n-provider';
import { LanguageSwitcher } from '~/shared/language-switcher';
import { ThemeSwitcher } from '~/shared/theme-switcher';
import { Logo } from '~/shared/logo';
import { useMe } from '~/shared/use-me';

/** Başlık + içerik + alt bilgi. Menüye yeni bölümler `menu` dizisinden eklenir. */
export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const localePath = useLocalePath();
  const menu = [
    {
      key: 'coffee',
      title: t('layout.menu.coffee'),
      route: localePath('/products?category=Coffee'),
    },
    {
      key: 'equipment',
      title: t('layout.menu.equipment'),
      route: localePath('/products?category=Equipment'),
    },
    {
      key: 'accessory',
      title: t('layout.menu.accessory'),
      route: localePath('/products?category=Accessory'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <BasicMenu
        aria-label={t('layout.menu.label')}
        data={menu}
        logo={<Logo />}
        logoHref={localePath('/')}
        logoLabel={t('layout.homeLabel')}
        menuPosition="sticky"
        currentPath={location.pathname + location.search}
        onNavigate={(route) => navigate(route)}
        actions={<HeaderActions />}
      />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function HeaderActions() {
  const me = useMe();
  const t = useT();
  const localePath = useLocalePath();

  return (
    <div className="flex items-center gap-1">
      <LanguageSwitcher />
      <ThemeSwitcher />
      <Button
        href={localePath('/products')}
        variant="ghost"
        size="sm"
        icon={<Search size={18} aria-hidden />}
        aria-label={t('layout.search')}
      />
      {me ? (
        <>
          <Button
            href={localePath('/list')}
            variant="ghost"
            size="sm"
            icon={<ListChecks size={18} aria-hidden />}
          >
            {t('layout.myList')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={18} aria-hidden />}
            onClick={() => logout(localePath('/'))}
            aria-label={t('layout.logout')}
          />
        </>
      ) : (
        <Button href={localePath('/login')} size="sm" color="primary">
          {t('layout.login')}
        </Button>
      )}
    </div>
  );
}

function SiteFooter() {
  const t = useT();
  const footerLinks = [
    {
      title: t('layout.footer.shop'),
      links: [
        { to: '/products?category=Coffee', label: t('layout.footer.coffee') },
        { to: '/products?category=Equipment', label: t('layout.footer.equipment') },
        { to: '/products?category=Accessory', label: t('layout.footer.accessory') },
      ],
    },
    {
      title: t('layout.footer.account'),
      links: [
        { to: '/login', label: t('layout.footer.login') },
        { to: '/register', label: t('layout.footer.register') },
        { to: '/list', label: t('layout.footer.list') },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-mari-border bg-mari-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-4 md:col-span-2">
          <LocaleLink to="/" aria-label={t('layout.homeLabel')} className="w-fit">
            <Logo />
          </LocaleLink>
          <Text muted className="max-w-sm text-sm leading-relaxed">
            {t('layout.footer.about')}
          </Text>
        </div>
        {footerLinks.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <Text weight="semibold" className="text-sm">
              {group.title}
            </Text>
            <ul className="mt-4 space-y-3 text-sm">
              {group.links.map((link) => (
                <li key={link.to}>
                  <LocaleLink
                    to={link.to}
                    className="text-mari-muted transition-colors hover:text-mari-foreground"
                  >
                    {link.label}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Text muted className="block border-t border-mari-border py-6 text-center text-xs">
        {t('layout.footer.copyright', { year: new Date().getFullYear() })}
      </Text>
    </footer>
  );
}
