import type { ProductResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { Empty } from '@mari-ui/components/empty';
import { Image } from '@mari-ui/components/image';
import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
import { Tag } from '@mari-ui/components/tag';
import { productImageSrc } from '~/shared/catalog';
import { useT } from '~/shared/i18n/i18n-provider';

/** Tükenen ve azalan ürünler: önce tükenenler, sonra en az kalandan başlayarak. */
export function StockAlerts({
  outOfStock,
  lowStock,
  loading,
}: {
  outOfStock: ProductResponse[];
  lowStock: ProductResponse[];
  loading: boolean;
}) {
  const t = useT();

  return (
    <Card
      title={t('dashboard.alerts.title')}
      extra={
        <Button href="/products" variant="link" size="sm">
          {t('dashboard.alerts.go')}
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={[...outOfStock, ...lowStock]}
        rowKey="id"
        empty={
          <Empty
            size="sm"
            title={t('dashboard.alerts.emptyTitle')}
            description={t('dashboard.alerts.emptyText')}
          />
        }
        renderItem={(p) => (
          <ListItem
            extra={
              <Tag color={p.stock <= 0 ? 'error' : 'warning'} variant="soft">
                {p.stock <= 0
                  ? t('dashboard.alerts.soldOut')
                  : t('dashboard.alerts.count', { count: p.stock })}
              </Tag>
            }
          >
            <ListItemMeta
              avatar={
                <Image
                  src={productImageSrc(p.imageUrl)}
                  alt=""
                  width={40}
                  height={40}
                  fit="cover"
                  wrapperClassName="overflow-hidden rounded-mari-md"
                />
              }
              title={p.name}
              description={p.sku}
            />
          </ListItem>
        )}
      />
    </Card>
  );
}
