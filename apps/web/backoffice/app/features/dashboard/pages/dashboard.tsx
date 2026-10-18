import { formatPrice } from '@ako/ui';
import { Button } from '@mari-ui/components/button';
import { AlertTriangle, Coins, Package, PackageX, Plus, Users } from 'lucide-react';
import { PageHeader } from '../../../shared/page-header';
import { useMe } from '../../../shared/use-me';
import { RecentUsers } from '../components/recent-users';
import { StatCard } from '../components/stat-card';
import { StockAlerts } from '../components/stock-alerts';
import { useDashboard } from '../hooks/use-dashboard';

export function meta() {
  return [{ title: 'Genel bakış | Akı Kahve Yönetim' }];
}

export default function DashboardPage() {
  const me = useMe();
  const d = useDashboard();
  const name = (me?.email ?? '').split('@')[0];

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ürünler"
          value={d.productCount}
          icon={Package}
          tone="primary"
          loading={d.isLoading}
        />
        <StatCard
          label="Tükenen"
          value={d.outOfStock.length}
          icon={PackageX}
          tone={d.outOfStock.length ? 'error' : 'neutral'}
          loading={d.isLoading}
        />
        <StatCard
          label="Azalan stok"
          value={d.lowStock.length}
          hint="10 adet ve altı"
          icon={AlertTriangle}
          tone={d.lowStock.length ? 'warning' : 'neutral'}
          loading={d.isLoading}
        />
        <StatCard label="Müşteriler" value={d.userCount} icon={Users} loading={d.isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StockAlerts outOfStock={d.outOfStock} lowStock={d.lowStock} />
        </div>
        <div className="flex flex-col gap-6">
          <StatCard
            label="Stok değeri"
            value={formatPrice(d.stockValue)}
            hint="Satış fiyatıyla"
            icon={Coins}
            loading={d.isLoading}
          />
          <RecentUsers users={d.recentUsers} />
        </div>
      </div>
    </div>
  );
}
