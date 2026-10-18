import type { AdminUserResponse, PagedResponseOfAdminUserResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Popconfirm } from '@mari-ui/components/popconfirm';
import { Table, type ColumnDef } from '@mari-ui/components/table';
import { Tag } from '@mari-ui/components/tag';
import { ADMIN_ROLE, useToggleAdmin } from '../hooks/use-users';

const date = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' });

interface UsersTableProps {
  users: PagedResponseOfAdminUserResponse | undefined;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function UsersTable({ users, loading, onPageChange }: UsersTableProps) {
  const admin = useToggleAdmin();

  const columns: ColumnDef<AdminUserResponse>[] = [
    { header: 'E-posta', columnName: 'email', render: (_, user) => user.email ?? user.userName },
    {
      header: 'Roller',
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
      header: 'Durum',
      columnName: 'emailConfirmed',
      render: (_, user) =>
        user.lockedOut ? (
          <Tag color="error">Kilitli</Tag>
        ) : user.emailConfirmed ? (
          <Tag color="success" variant="soft">
            Doğrulandı
          </Tag>
        ) : (
          <Tag color="warning" variant="soft">
            Doğrulanmadı
          </Tag>
        ),
    },
    {
      header: 'Giriş',
      columnName: 'logins',
      render: (_, user) => (user.logins.length ? user.logins.join(', ') : 'E-posta'),
    },
    {
      header: 'Kayıt',
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
            title={isAdmin ? 'Admin rolü kaldırılsın mı?' : 'Admin yapılsın mı?'}
            description={user.email ?? user.userName}
            okText="Evet"
            cancelText="Vazgeç"
            onConfirm={() => admin.toggle(user)}
          >
            <Button size="sm" variant="ghost" loading={admin.isPending}>
              {isAdmin ? 'Admin rolünü al' : 'Admin yap'}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Table
      label="Kullanıcılar"
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
      emptyState={{ title: 'Kullanıcı bulunamadı' }}
    />
  );
}
