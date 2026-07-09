import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, YStack } from 'tamagui';
import { TopBanner } from '@/features/promotions/components/top-banner';
import { IosEdgeSwipeBack } from '@/components/ui/ios-edge-swipe-back';

type AppScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  header?: ReactNode;
  padding?: any;
  gap?: any;
  /** Page surface token. Defaults to `$background`; use a tinted token (e.g. `$color2`) for card-on-surface layouts. */
  backgroundColor?: any;
  /** Top safe-area (status bar) + header strip surface token. Defaults to `backgroundColor`; pass a scroll-driven token for a collapsing header. */
  topBackgroundColor?: any;
  /** Scroll handler for the content ScrollView (e.g. to drive a collapsing header). */
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}>;

export function AppScreen({
  children,
  scrollable = true,
  header,
  padding = '$4',
  gap = '$4',
  backgroundColor = '$background',
  topBackgroundColor,
  onScroll,
}: AppScreenProps) {
  const theme = useTheme();
  const surfaceToken = (topBackgroundColor ?? backgroundColor).replace('$', '');
  const surface = theme[surfaceToken]?.val ?? theme.background.val;

  const content = (
    <YStack flex={1} gap={gap} padding={padding}>
      {children}
    </YStack>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ backgroundColor: surface, flex: 1 }}>
      <TopBanner />
      {header}
      <YStack backgroundColor={backgroundColor} flex={1}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </YStack>
      <IosEdgeSwipeBack />
    </SafeAreaView>
  );
}
