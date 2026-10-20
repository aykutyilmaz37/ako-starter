import { useToast } from '@mari-ui/native/toast';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import type { Product } from '~/features/catalog/data/schema';
import { useT } from '~/features/localization/i18n';
import { addItem, itemsQuery, removeItem, toggleItem } from './queries';

/** Alışveriş listesi; liste değişince ekran kendiliğinden yenilenir (`useLiveQuery`). */
export function useShoppingList() {
  const { data } = useLiveQuery(itemsQuery);
  return { items: data, add: addItem, toggle: toggleItem, remove: removeItem };
}

/** Ürünü alışveriş listesine ekler; başarıda "Listeyi aç" eylemli bildirim gösterir. */
export function useAddToList() {
  const { showToast } = useToast();
  const t = useT();

  return {
    isPending: false,
    add: (product: Product) =>
      addItem(product.name).then(
        () =>
          showToast({
            title: t('product.added'),
            type: 'success',
            action: { label: t('product.openList'), onPress: () => router.navigate('/list') },
          }),
        () => showToast({ title: t('product.addFailed'), type: 'error' }),
      ),
  };
}
