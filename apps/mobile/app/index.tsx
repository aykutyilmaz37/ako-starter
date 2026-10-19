import { Button, Text, Title } from '@mari-ui/native';
import { useListProducts } from '@ako/api-client/products';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { data, isPending, error, refetch } = useListProducts();

  return (
    <View style={{ flex: 1, padding: 24, paddingTop: insets.top + 24, gap: 12 }}>
      <Title>Akı Kahve</Title>
      {isPending ? <Text>Yükleniyor…</Text> : null}
      {error ? <Text>Ürünler alınamadı: {error.message}</Text> : null}
      {data ? <Text>{data.items?.length ?? 0} ürün</Text> : null}
      <Button onPress={() => void refetch()}>Yenile</Button>
    </View>
  );
}
