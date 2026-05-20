import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, useTheme, YStack } from 'tamagui';

type AppScreenProps = PropsWithChildren<{
  scrollable?: boolean;
}>;

export function AppScreen({ children, scrollable = true }: AppScreenProps) {
  const theme = useTheme();

  const content = (
    <YStack flex={1} gap="$4" padding="$4">
      {children}
    </YStack>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: theme.background.val, flex: 1 }}
    >
      <YStack backgroundColor="$background" flex={1}>
        {scrollable ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </YStack>
    </SafeAreaView>
  );
}
