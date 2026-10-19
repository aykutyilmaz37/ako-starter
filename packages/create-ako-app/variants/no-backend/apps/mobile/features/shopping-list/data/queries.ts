import { asc, eq, not } from 'drizzle-orm';
import { db } from '~/lib/db';
import { shoppingItems, type ShoppingItem } from './schema';

/** `useLiveQuery` bu sorguyu izler: tablo değişince ekran kendiliğinden güncellenir. */
export const itemsQuery = db
  .select()
  .from(shoppingItems)
  .orderBy(asc(shoppingItems.createdAt), asc(shoppingItems.id));

export async function addItem(title: string): Promise<void> {
  await db.insert(shoppingItems).values({ title });
}

export async function toggleItem(item: ShoppingItem): Promise<void> {
  await db
    .update(shoppingItems)
    .set({ isDone: not(shoppingItems.isDone) })
    .where(eq(shoppingItems.id, item.id));
}

export async function removeItem(item: ShoppingItem): Promise<void> {
  await db.delete(shoppingItems).where(eq(shoppingItems.id, item.id));
}
