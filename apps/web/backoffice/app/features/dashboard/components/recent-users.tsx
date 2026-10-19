import type { AdminUserResponse } from '@ako/api-client/model';
import { Avatar } from '@mari-ui/components/avatar';
import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';

const relative = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' });

function ago(date: string) {
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
  return days === 0 ? 'bugün' : relative.format(days, 'day');
}

export function RecentUsers({ users, loading }: { users: AdminUserResponse[]; loading: boolean }) {
  return (
    <Card
      title="Son kayıt olanlar"
      extra={
        <Button href="/users" variant="link" size="sm">
          Tümü
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={users}
        rowKey="id"
        renderItem={(u) => {
          const email = u.email ?? u.userName;
          return (
            <ListItem>
              <ListItemMeta
                avatar={<Avatar size="sm" alt={email} />}
                title={email}
                description={ago(u.createdAt)}
              />
            </ListItem>
          );
        }}
      />
    </Card>
  );
}
