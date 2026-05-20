import { Tabs } from 'expo-router';
import { Grid2x2, House, ShoppingCart, UserRound } from '@tamagui/lucide-icons-2';
import { useTheme } from 'tamagui';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.background.val,
        },
        tabBarActiveTintColor: theme.color.val,
        tabBarInactiveTintColor: theme.color10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size }) => <House size={size} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ size }) => <Grid2x2 size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ size }) => <ShoppingCart size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size }) => <UserRound size={size} />,
        }}
      />
    </Tabs>
  );
}
