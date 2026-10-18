import { logout } from '@ako/ui';
import { Button } from '@mari-ui/components/button';
import { ListChecks, LogOut, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { Logo } from './logo';
import { useMe } from './use-me';

const nav = [
  { to: '/products?category=Coffee', label: 'Kahveler' },
  { to: '/products?category=Equipment', label: 'Ekipman' },
  { to: '/products?category=Accessory', label: 'Aksesuar' },
];

/** Başlık + içerik + alt bilgi. Menüye yeni bölümler buradan eklenir. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        İçeriğe geç
      </a>
      <SiteHeader />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const me = useMe();

  return (
    <header className="sticky top-0 z-40 border-b border-mari-border bg-mari-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Ana menü" className="hidden gap-6 text-sm font-medium md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className="transition-colors hover:text-mari-primary"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
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
                <span className="hidden sm:inline">Listem</span>
              </Button>
              <span className="hidden max-w-40 truncate px-2 text-sm text-mari-muted lg:inline">
                {me.email ?? me.userName}
              </span>
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
      </div>
      {/* Dar ekranda kategori menüsü başlığın altında, yatay kaydırılabilir. */}
      <nav
        aria-label="Kategoriler"
        className="flex gap-5 overflow-x-auto px-4 pb-3 text-sm font-medium md:hidden"
      >
        {nav.map((item) => (
          <NavLink key={item.label} to={item.to} className="shrink-0 hover:text-mari-primary">
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-mari-border bg-mari-surface-alt">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mari-muted">
            Moda'da küçük bir kavurma atölyesi. Çekirdekleri çiftlik bazında seçiyor, haftada iki
            kez kavuruyor ve kavrulduğu hafta kapınıza gönderiyoruz.
          </p>
        </div>
        <FooterLinks
          title="Mağaza"
          links={[
            { to: '/products?category=Coffee', label: 'Kahveler' },
            { to: '/products?category=Equipment', label: 'Demleme ekipmanı' },
            { to: '/products?category=Accessory', label: 'Aksesuar' },
          ]}
        />
        <FooterLinks
          title="Hesap"
          links={[
            { to: '/login', label: 'Giriş yap' },
            { to: '/register', label: 'Hesap oluştur' },
            { to: '/list', label: 'Alışveriş listem' },
          ]}
        />
      </div>
      <div className="border-t border-mari-border py-6 text-center text-xs text-mari-muted">
        © {new Date().getFullYear()} Akı Kahve · Bu bir örnek mağazadır, sipariş alınmaz.
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h2 className="font-sans text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-mari-muted">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="transition-colors hover:text-mari-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
