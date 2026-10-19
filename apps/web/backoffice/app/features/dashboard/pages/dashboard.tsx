import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { List } from '@mari-ui/components/list';
import { Statistic } from '@mari-ui/components/statistic';
import { Plus } from 'lucide-react';
import { RecentUsers } from '~/features/dashboard/components/recent-users';
import { StockAlerts } from '~/features/dashboard/components/stock-alerts';
import { useDashboard } from '~/features/dashboard/hooks/use-dashboard';
import { PageHeader } from '~/shared/page-header';
import { useMe } from '~/shared/use-me';

export function meta() {
  return [{ title: 'Genel bakış | Akı Kahve Yönetim' }];
}

export default function DashboardPage() {
  const me = useMe();
  const d = useDashboard();
  const name = (me?.email ?? '').split('@')[0];

  const stats = [
    { key: 'products', title: 'Ürünler', value: d.productCount },
    { key: 'out', title: 'Tükenen', value: d.outOfStock.length },
    { key: 'low', title: 'Azalan stok', value: d.lowStock.length, description: '10 adet ve altı' },
    { key: 'users', title: 'Müşteriler', value: d.userCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Merhaba${name ? `, ${name}` : ''}`}
        description="Mağazanın bugünkü durumu."
        actions={
          <Button href="/products?new=1" color="primary" icon={<Plus size={16} aria-hidden />}>
            Yeni ürün
          </Button>
        }
      />

      <List
        aria-label="Özet"
        dataSource={stats}
        rowKey="key"
        grid={{ columns: { base: 1, sm: 2, xl: 4 }, gap: 'md' }}
        renderItem={(s) => (
          <Card skeleton={d.isLoading}>
            <Statistic title={s.title} value={s.value} description={s.description} animated />
          </Card>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockAlerts outOfStock={d.outOfStock} lowStock={d.lowStock} loading={d.isLoading} />
        </div>
        <div className="flex flex-col gap-6">
          <Card skeleton={d.isLoading}>
            <Statistic
              title="Stok değeri"
              value={d.stockValue}
              precision={2}
              locale="tr-TR"
              suffix="₺"
              description="Satış fiyatıyla"
            />
          </Card>
          <RecentUsers users={d.recentUsers} loading={d.isLoading} />
        </div>
      </div>
    </div>
  );
}
