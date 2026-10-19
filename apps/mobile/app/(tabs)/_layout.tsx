import { useTheme } from '@mari-ui/native';
import { Tabs } from 'expo-router';
import { Coffee, Store, User } from 'lucide-react-native';

export default function TabsLayout() {
  const { color } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary.solid,
        tabBarInactiveTintColor: color.canvas.muted,
        tabBarStyle: { backgroundColor: color.canvas.surface, borderTopColor: color.canvas.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: color.canvas.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana sayfa',
          tabBarIcon: ({ color: c, size }) => <Coffee color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Mağaza',
          tabBarIcon: ({ color: c, size }) => <Store color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Hesap',
          tabBarIcon: ({ color: c, size }) => <User color={c} size={size} />,
        }}
      />
    </Tabs>
  );
}
