import { SearchInput } from '@mari-ui/components/input';
import { Title } from '@mari-ui/components/typography';
import { useSearchParams } from 'react-router';
import { UsersTable } from '../components/users-table';
import { useUsers } from '../hooks/use-users';

export function meta() {
  return [{ title: 'Kullanıcılar | Ako Backoffice' }];
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
      <Title level={2}>Kullanıcılar</Title>
      <SearchInput
        placeholder="E-posta ile ara"
        defaultValue={search ?? ''}
        onSearch={(value) => setParam('search', value || undefined)}
      />
      <UsersTable
        users={users.data}
        loading={users.isFetching}
        onPageChange={(p) => setParam('page', String(p))}
      />
    </section>
  );
}
