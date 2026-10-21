import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { List } from '@mari-ui/components/list';
import { Statistic } from '@mari-ui/components/statistic';
import { Plus } from 'lucide-react'; // ako:sample
import { RecentUsers } from '~/features/dashboard/components/recent-users';
import { StockAlerts } from '~/features/dashboard/components/stock-alerts'; // ako:sample
import { useDashboard } from '~/features/dashboard/hooks/use-dashboard';
import { metaTranslator } from '~/shared/i18n/i18n';
import { useI18n } from '~/shared/i18n/i18n-provider';
import { PageHeader } from '~/shared/page-header';
import { useMe } from '~/shared/use-me';
import type { Route } from './+types/dashboard';

export function meta({ matches }: Route.MetaArgs) {
  return [{ title: metaTranslator(matches)('dashboard.meta') }];
}

export default function DashboardPage() {
  const me = useMe();
  const { lang, t } = useI18n();
  const d = useDashboard();
  const name = (me?.email ?? '').split('@')[0];

  const stats: { key: string; title: string; value: number; description?: string }[] = [
    // ako:begin sample
    { key: 'products', title: t('dashboard.stat.products'), value: d.productCount },
    { key: 'out', title: t('dashboard.stat.out'), value: d.outOfStock.length },
    {
      key: 'low',
      title: t('dashboard.stat.low'),
      value: d.lowStock.length,
      description: t('dashboard.stat.lowHint'),
    },
    // ako:end sample
    { key: 'users', title: t('dashboard.stat.users'), value: d.userCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={name ? t('dashboard.greeting', { name }) : t('dashboard.greetingAnon')}
        description={t('dashboard.description')}
        actions={
          // ako:begin sample
          <Button href="/products?new=1" color="primary" icon={<Plus size={16} aria-hidden />}>
            {t('dashboard.newProduct')}
          </Button>
          // ako:else sample
          //~ undefined
          // ako:end sample
        }
      />

      <List
        aria-label={t('dashboard.summary')}
        dataSource={stats}
        rowKey="key"
        grid={{ columns: { base: 1, sm: 2, xl: 4 }, gap: 'md' }}
        renderItem={(s) => (
          <Card skeleton={d.isLoading}>
            <Statistic title={s.title} value={s.value} description={s.description} animated />
          </Card>
        )}
      />

      {/* ako:begin sample */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockAlerts outOfStock={d.outOfStock} lowStock={d.lowStock} loading={d.isLoading} />
        </div>
        <div className="flex flex-col gap-6">
          <Card skeleton={d.isLoading}>
            <Statistic
              title={t('dashboard.stockValue')}
              value={d.stockValue}
              precision={2}
              locale={lang}
              suffix="₺"
              description={t('dashboard.stockValueHint')}
            />
          </Card>
          <RecentUsers users={d.recentUsers} loading={d.isLoading} />
        </div>
      </div>
      {/* ako:else sample */}
      {/*~ <RecentUsers users={d.recentUsers} loading={d.isLoading} /> */}
      {/* ako:end sample */}
    </div>
  );
}
