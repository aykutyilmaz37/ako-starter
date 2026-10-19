import { Button } from '@mari-ui/components/button';
import { BasicMenu } from '@mari-ui/components/menu';
import { Text } from '@mari-ui/components/typography';
import { ListChecks, LogOut, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { logout } from '~/shared/api';
import { Logo } from '~/shared/logo';
import { useMe } from '~/shared/use-me';

const menu = [
  { key: 'coffee', title: 'Kahveler', route: '/products?category=Coffee' },
  { key: 'equipment', title: 'Ekipman', route: '/products?category=Equipment' },
  { key: 'accessory', title: 'Aksesuar', route: '/products?category=Accessory' },
];

/** Başlık + içerik + alt bilgi. Menüye yeni bölümler `menu` dizisinden eklenir. */
export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <BasicMenu
        aria-label="Ana menü"
        data={menu}
        logo={<Logo />}
        logoHref="/"
        logoLabel="Akı Kahve ana sayfa"
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

  return (
    <div className="flex items-center gap-1">
      <Button
        href="/products"
        variant="ghost"
        size="sm"
        icon={<Search size={18} aria-hidden />}
        aria-label="Ürünlerde ara"
      />
      {me ? (
        <>
          <Button
            href="/list"
            variant="ghost"
            size="sm"
            icon={<ListChecks size={18} aria-hidden />}
          >
            Listem
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={18} aria-hidden />}
            onClick={() => logout('/')}
            aria-label="Çıkış yap"
          />
        </>
      ) : (
        <Button href="/login" size="sm" color="primary">
          Giriş yap
        </Button>
      )}
    </div>
  );
}

const footerLinks = [
  {
    title: 'Mağaza',
    links: [
      { to: '/products?category=Coffee', label: 'Kahveler' },
      { to: '/products?category=Equipment', label: 'Demleme ekipmanı' },
      { to: '/products?category=Accessory', label: 'Aksesuar' },
    ],
  },
  {
    title: 'Hesap',
    links: [
      { to: '/login', label: 'Giriş yap' },
      { to: '/register', label: 'Hesap oluştur' },
      { to: '/list', label: 'Alışveriş listem' },
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-mari-border bg-mari-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-4 md:col-span-2">
          <Link to="/" aria-label="Akı Kahve ana sayfa" className="w-fit">
            <Logo />
          </Link>
          <Text muted className="max-w-sm text-sm leading-relaxed">
            Moda'da küçük bir kavurma atölyesi. Çekirdekleri çiftlik bazında seçiyor, haftada iki
            kez kavuruyor ve kavrulduğu hafta kapınıza gönderiyoruz.
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
                  <Link
                    to={link.to}
                    className="text-mari-muted transition-colors hover:text-mari-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Text muted className="block border-t border-mari-border py-6 text-center text-xs">
        © {new Date().getFullYear()} Akı Kahve · Bu bir örnek mağazadır, sipariş alınmaz.
      </Text>
    </footer>
  );
}
