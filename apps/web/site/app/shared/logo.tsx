import { Link } from 'react-router';

/** Akı Kahve logosu: kahve çekirdeği işareti + serif yazı. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2 ${className}`}
      aria-label="Akı Kahve ana sayfa"
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <ellipse
          cx="16"
          cy="16"
          rx="10"
          ry="14"
          transform="rotate(-30 16 16)"
          className="fill-mari-primary-solid"
        />
        <path
          d="M11 7 C 18 12, 14 20, 21 25"
          transform="rotate(-30 16 16)"
          className="stroke-mari-primary-solid-contrast"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-xl font-bold">Akı</span>
        <span className="text-[10px] font-semibold tracking-[0.3em] text-mari-muted">KAHVE</span>
      </span>
    </Link>
  );
}
