import type { AdminUserResponse } from '@ako/api-client/model';
import { Avatar } from '@mari-ui/components/avatar';
import { Link } from 'react-router';

const relative = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' });

function ago(date: string) {
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
  return days === 0 ? 'bugün' : relative.format(days, 'day');
}

export function RecentUsers({ users }: { users: AdminUserResponse[] }) {
  return (
    <section
      className="rounded-mari-lg border border-mari-border bg-mari-surface"
      aria-labelledby="son-musteriler"
    >
      <header className="flex items-center justify-between border-b border-mari-border px-5 py-4">
        <h2 id="son-musteriler" className="font-semibold">
          Son kayıt olanlar
        </h2>
        <Link to="/users" className="text-sm font-medium text-mari-primary">
          Tümü
        </Link>
      </header>
      <ul className="divide-y divide-mari-border">
        {users.map((u) => {
          const email = u.email ?? u.userName;
          return (
            <li key={u.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar size="sm" src={email.slice(0, 2).toUpperCase()} alt={email} />
              <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
              <span className="shrink-0 text-xs text-mari-muted">{ago(u.createdAt)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
