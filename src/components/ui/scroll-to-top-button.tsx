import { ChevronUp } from '@/components/ui/icons';
import { Pressable } from 'react-native';
import { YStack } from 'tamagui';

type ScrollToTopButtonProps = {
  /** Butonun görünür olup olmadığı; listenin scroll offset'inden hesaplanır. */
  visible: boolean;
  onPress: () => void;
  /** İçinde bulunduğu alanın altından uzaklık. */
  bottom?: number;
  right?: number;
  testID?: string;
};

const BUTTON_SIZE = 44;

/**
 * Uzun listelerde sağ alt köşede beliren "en başa dön" butonu.
 * Yarı saydam koyu zemin + beyaz ok, iki temada da okunur.
 */
export function ScrollToTopButton({
  visible,
  onPress,
  bottom = 16,
  right = 16,
  testID = 'scroll-to-top-button',
}: ScrollToTopButtonProps) {
  if (!visible) return null;

  return (
    <YStack bottom={bottom} position="absolute" right={right} zIndex={20}>
      <Pressable
        accessibilityLabel="Sayfanın başına dön"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: BUTTON_SIZE / 2,
          height: BUTTON_SIZE,
          justifyContent: 'center',
          opacity: pressed ? 0.75 : 1,
          width: BUTTON_SIZE,
        })}
        testID={testID}
      >
        <ChevronUp color="white" size={26} strokeWidth={2.5} />
      </Pressable>
    </YStack>
  );
}
