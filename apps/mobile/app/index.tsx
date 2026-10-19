import { useListProducts } from '@ako/api-client/products';
import { Button, Text, Title } from '@mari-ui/native';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '~/lib/session';
import { s } from '~/lib/strings';

// Geçici ana ekran; ürün listesi/detay maddesinde gerçek katalogla değişecek.
export default function Home() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useSession();
  const { data, isPending, error, refetch } = useListProducts();

  return (
    <View style={{ flex: 1, padding: 24, paddingTop: insets.top + 24, gap: 12 }}>
      <Title>{s.appName}</Title>
      {user ? <Text>{user.email}</Text> : null}
      {isPending ? <Text>…</Text> : null}
      {error ? <Text>{s.home.loadFailed}</Text> : null}
      {data ? <Text>{s.home.products(data.items?.length ?? 0)}</Text> : null}
      <Button variant="outline" onPress={() => void refetch()}>
        {s.home.retry}
      </Button>
      {user ? (
        <Button variant="ghost" onPress={() => void signOut()}>
          {s.home.logout}
        </Button>
      ) : (
        <Button onPress={() => router.push('/login')}>{s.home.login}</Button>
      )}
    </View>
  );
}
