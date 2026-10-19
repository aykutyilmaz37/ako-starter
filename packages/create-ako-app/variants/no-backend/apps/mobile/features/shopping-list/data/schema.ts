import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Alışveriş listesi: kullanıcının ürettiği veri, cihazdaki SQLite'ta durur. */
export const shoppingItems = sqliteTable('shopping_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ShoppingItem = typeof shoppingItems.$inferSelect;
