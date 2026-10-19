import type { AdminUserResponse } from '@ako/api-client/model';
import { Avatar } from '@mari-ui/components/avatar';
import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
import { useI18n } from '~/shared/i18n/i18n-provider';

export function RecentUsers({ users, loading }: { users: AdminUserResponse[]; loading: boolean }) {
  const { lang, t } = useI18n();
  const relative = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const ago = (date: string) => {
    const days = Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
    return days === 0 ? t('dashboard.recent.today') : relative.format(days, 'day');
  };

  return (
    <Card
      title={t('dashboard.recent.title')}
      extra={
        <Button href="/users" variant="link" size="sm">
          {t('dashboard.recent.all')}
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
