import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Text, View } from 'react-native';
import migrations from '~/drizzle/migrations';
import { db } from '~/shared/lib/db';

/**
 * Uygulamayla paketlenen migration'ları (`drizzle/`) uygular; bitmeden ekranlar açılmaz.
 * Şemayı değiştirince: `pnpm --filter @ako/mobile db:generate`.
 */
export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text>Veritabanı hazırlanamadı: {error.message}</Text>
      </View>
    );
  }
  return success ? children : null;
}
