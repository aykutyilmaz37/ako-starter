import { SearchInput } from '@mari-ui/components/input';
import { PageHeader } from '~/shared/page-header';
import { useSearchParams } from 'react-router';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useT } from '~/shared/i18n/i18n-provider';
import type { Route } from './+types/users';
import { UsersTable } from '~/features/users/components/users-table';
import { useUsers } from '~/features/users/hooks/use-users';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('users.meta') }];
}

/**
 * Backoffice sayfaları veriyi tarayıcıda (TanStack Query) çeker: SEO gerekmez, tablolar etkileşimlidir.
 * Arama ve sayfa URL'de durur; link paylaşılınca aynı görünüm açılır.
 */
export default function UsersPage() {
  const [params, setParams] = useSearchParams();
  const t = useT();
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
      <PageHeader title={t('users.title')} description={t('users.description')} />
      <SearchInput
        placeholder={t('users.search.placeholder')}
        size="sm"
        aria-label={t('users.search.label')}
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
