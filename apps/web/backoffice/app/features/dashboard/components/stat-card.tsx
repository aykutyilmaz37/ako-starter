import { Skeleton } from '@mari-ui/components/skeleton';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'warning' | 'error' | 'neutral';
  loading?: boolean;
}

const tones = {
  primary: 'bg-mari-primary-subtle text-mari-primary-subtle-contrast',
  warning: 'bg-mari-warning-subtle text-mari-warning-subtle-contrast',
  error: 'bg-mari-error-subtle text-mari-error-subtle-contrast',
  neutral: 'bg-mari-neutral-subtle text-mari-neutral-subtle-contrast',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
  loading,
}: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-mari-lg border border-mari-border bg-mari-surface p-5">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-mari-md ${tones[tone]}`}
      >
        <Icon size={20} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-mari-muted">{label}</p>
        {loading ? (
          <Skeleton active title={false} paragraph={{ rows: 1 }} />
        ) : (
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-mari-muted">{hint}</p>}
      </div>
    </div>
  );
}
