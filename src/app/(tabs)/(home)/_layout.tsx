import { Stack } from 'expo-router';
import { useTheme } from 'tamagui';

export default function HomeStackLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.background.val,
        },
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        headerShown: false,
      }}
    />
  );
}
