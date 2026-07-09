import { Stack } from 'expo-router';
import { YStack, useTheme } from 'tamagui';
import { BottomNavigationBar } from '@/components/navigation/bottom-navigation-bar';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <YStack backgroundColor="$background" flex={1}>
      <YStack flex={1}>
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: theme.background.val,
            },
            fullScreenGestureEnabled: true,
            gestureEnabled: true,
            headerShown: false,
          }}
        />
      </YStack>
      <BottomNavigationBar />
    </YStack>
  );
}
