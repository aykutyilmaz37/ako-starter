import { SOCIAL_BRANDS } from '@ako/shared';
import type { CSSProperties } from 'react';

/**
 * Sağlayıcının kendi markasıyla (ikon + renk) sosyal giriş bağlantısı. Renkler CSS değişkenleriyle gelir;
 * koyu tema karşılıkları app.css'teki `.social-button` kurallarında.
 */
export function SocialButton({
  provider,
  label,
  href,
}: {
  provider: string;
  label: string;
  href: string;
}) {
  const brand = SOCIAL_BRANDS[provider];
  if (!brand) return null;

  const style = {
    '--sb-bg': brand.background,
    '--sb-fg': brand.foreground,
    '--sb-border': brand.border,
    '--sb-dark-bg': brand.dark?.background ?? brand.background,
    '--sb-dark-fg': brand.dark?.foreground ?? brand.foreground,
    '--sb-dark-border': brand.dark?.border ?? brand.border,
  } as CSSProperties;

  return (
    // Tam sayfa yönlendirme: OAuth akışı BFF → API → sağlayıcı → geri.
    <a
      href={href}
      style={style}
      className="social-button flex min-h-11 items-center justify-center gap-3 rounded-mari-md border px-4 text-sm font-semibold no-underline transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <svg width="20" height="20" viewBox={brand.viewBox} aria-hidden="true">
        {brand.paths.map((path) => (
          <path key={path.d} d={path.d} fill={path.fill ?? 'currentColor'} />
        ))}
      </svg>
      {label}
    </a>
  );
}
