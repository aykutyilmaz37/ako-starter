import type { AdminUserResponse, PagedResponseOfAdminUserResponse } from '@ako/api-client/model';
import { Avatar } from '@mari-ui/components/avatar';
import { Button } from '@mari-ui/components/button';
import { Popconfirm } from '@mari-ui/components/popconfirm';
import { Table, type ColumnDef } from '@mari-ui/components/table';
import { Tag } from '@mari-ui/components/tag';
import { ADMIN_ROLE, useToggleAdmin } from '~/features/users/hooks/use-users';
import { useI18n } from '~/shared/i18n/i18n-provider';

interface UsersTableProps {
  users: PagedResponseOfAdminUserResponse | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function UsersTable({ users, loading, onPageChange }: UsersTableProps) {
  const admin = useToggleAdmin();
  const { lang, t } = useI18n();
  const date = new Intl.DateTimeFormat(lang, { dateStyle: 'medium' });

  const columns: ColumnDef<AdminUserResponse>[] = [
    {
      header: t('users.col.customer'),
      columnName: 'email',
      render: (_, user) => {
        const email = user.email ?? user.userName;
        return (
          <div className="flex items-center gap-3">
            <Avatar size="sm" alt={email} />
            <span className="truncate">{email}</span>
          </div>
        );
      },
    },
    {
      header: t('users.col.roles'),
      columnName: 'roles',
      render: (_, user) => (
        <div className="flex gap-1">
          {user.roles.map((role) => (
            <Tag key={role} color={role === ADMIN_ROLE ? 'primary' : 'neutral'} variant="soft">
              {role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      header: t('users.col.status'),
      columnName: 'emailConfirmed',
      render: (_, user) =>
        user.lockedOut ? (
          <Tag color="error">{t('users.status.locked')}</Tag>
        ) : user.emailConfirmed ? (
          <Tag color="success" variant="soft">
            {t('users.status.verified')}
          </Tag>
        ) : (
          <Tag color="warning" variant="soft">
            {t('users.status.unverified')}
          </Tag>
        ),
    },
    {
      header: t('users.col.login'),
      columnName: 'logins',
      render: (_, user) => (user.logins.length ? user.logins.join(', ') : t('users.loginEmail')),
    },
    {
      header: t('users.col.created'),
      columnName: 'createdAt',
      render: (_, user) => date.format(new Date(user.createdAt)),
    },
    {
      header: '',
      columnName: 'id',
      align: 'end',
      render: (_, user) => {
        const isAdmin = user.roles.includes(ADMIN_ROLE);
        return (
          <Popconfirm
            title={isAdmin ? t('users.confirm.remove') : t('users.confirm.make')}
            description={user.email ?? user.userName}
            okText={t('users.confirm.yes')}
            cancelText={t('common.cancel')}
            onConfirm={() => admin.toggle(user)}
          >
            <Button size="sm" variant="ghost" loading={admin.isPending}>
              {isAdmin ? t('users.removeAdmin') : t('users.makeAdmin')}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Table
      label={t('users.table')}
      data={users?.items ?? []}
      columns={columns}
      skeleton={loading && !users}
      paginationMode="server"
      pagination={{
        page: users?.page ?? 1,
        pageSize: users?.pageSize ?? 20,
        total: users?.totalCount ?? 0,
        onPageChange,
      }}
      emptyState={{ title: t('users.empty') }}
    />
  );
}
