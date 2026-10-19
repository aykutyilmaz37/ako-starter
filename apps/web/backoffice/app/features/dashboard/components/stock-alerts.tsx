import type { ProductResponse } from '@ako/api-client/model';
import { Button } from '@mari-ui/components/button';
import { Card } from '@mari-ui/components/card';
import { Empty } from '@mari-ui/components/empty';
import { Image } from '@mari-ui/components/image';
import { List, ListItem, ListItemMeta } from '@mari-ui/components/list';
import { Tag } from '@mari-ui/components/tag';
import { productImageSrc } from '~/shared/catalog';

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
  return (
    <Card
      title="Stok uyarıları"
      extra={
        <Button href="/products" variant="link" size="sm">
          Ürünlere git
        </Button>
      }
    >
      <List
        loading={loading}
        dataSource={[...outOfStock, ...lowStock]}
        rowKey="id"
        empty={
          <Empty size="sm" title="Her şey stokta" description="Tükenen ya da azalan ürün yok." />
        }
        renderItem={(p) => (
          <ListItem
            extra={
              <Tag color={p.stock <= 0 ? 'error' : 'warning'} variant="soft">
                {p.stock <= 0 ? 'Tükendi' : `${p.stock} adet`}
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
