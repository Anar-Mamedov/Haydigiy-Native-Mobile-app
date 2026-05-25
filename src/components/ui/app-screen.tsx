import { PropsWithChildren, ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, useTheme, YStack } from 'tamagui';
import { TopBanner } from '@/features/promotions/components/top-banner';

type AppScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  header?: ReactNode;
  padding?: any;
  gap?: any;
}>;

export function AppScreen({
  children,
  scrollable = true,
  header,
  padding = '$4',
  gap = '$4',
}: AppScreenProps) {
  const theme = useTheme();

  const content = (
    <YStack flex={1} gap={gap} padding={padding}>
      {children}
    </YStack>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: theme.background.val, flex: 1 }}
    >
      <TopBanner />
      {header}
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
