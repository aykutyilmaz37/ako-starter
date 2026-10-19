import { useTheme } from '@mari-ui/native';
import { Tabs } from 'expo-router';
import { Coffee, ListChecks, Store, User } from 'lucide-react-native';
import { useT } from '~/lib/i18n';

export default function TabsLayout() {
  const { color } = useTheme();
  const t = useT();

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
          title: t('tab.home'),
          tabBarIcon: ({ color: c, size }) => <Coffee color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t('tab.shop'),
          tabBarIcon: ({ color: c, size }) => <Store color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: t('tab.list'),
          tabBarIcon: ({ color: c, size }) => <ListChecks color={c} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('tab.account'),
          tabBarIcon: ({ color: c, size }) => <User color={c} size={size} />,
        }}
      />
    </Tabs>
  );
}
