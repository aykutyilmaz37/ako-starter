import { SearchInput } from '@mari-ui/components/input';
import { PageHeader } from '../../../shared/page-header';
import { useSearchParams } from 'react-router';
import { UsersTable } from '../components/users-table';
import { useUsers } from '../hooks/use-users';

export function meta() {
  return [{ title: 'Müşteriler | Akı Kahve Yönetim' }];
}

/**
 * Backoffice sayfaları veriyi tarayıcıda (TanStack Query) çeker: SEO gerekmez, tablolar etkileşimlidir.
 * Arama ve sayfa URL'de durur; link paylaşılınca aynı görünüm açılır.
 */
export default function UsersPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? undefined;
  const users = useUsers({ page, pageSize: 20, search });

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Müşteriler" description="Kayıtlı hesaplar, roller ve giriş yöntemleri." />
      <SearchInput
        placeholder="E-posta ile ara"
        size="sm"
        aria-label="Müşterilerde ara"
        defaultValue={search ?? ''}
        onSearch={(value) => setParam('search', value || undefined)}
      />
      <div className="rounded-mari-lg border border-mari-border bg-mari-surface">
        <UsersTable
          users={users.data}
          loading={users.isFetching}
          onPageChange={(p) => setParam('page', String(p))}
        />
      </div>
    </section>
  );
}
