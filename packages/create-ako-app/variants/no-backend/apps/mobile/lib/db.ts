import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Tek veritabanı dosyası (işletim sisteminin otomatik yedeğine girer). `enableChangeListener`: `useLiveQuery` için.
const sqlite = openDatabaseSync('app.db', { enableChangeListener: true });

export const db = drizzle(sqlite);
