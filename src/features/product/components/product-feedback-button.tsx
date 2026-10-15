import { Pressable } from 'react-native';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { ThumbsUp } from '@/components/ui/icons';

/** Ürün detayının en altındaki "Geri Bildirim Ver" butonu; geri bildirim penceresini açar. */
export function ProductFeedbackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        marginHorizontal: 16,
        marginVertical: 12,
      })}
      testID="product-feedback-button"
    >
      <XStack
        alignItems="center"
        justifyContent="center"
        borderColor="$borderColor"
        borderWidth={2}
        backgroundColor="$background"
        borderRadius={8}
        // İçerik ~42dp kalıyordu; dokunma hedefi en az 48dp olmalı.
        minHeight={MIN_TOUCH_TARGET}
        paddingHorizontal={12}
        paddingVertical={10}
        gap={8}
      >
        <ThumbsUp size={16} color="$brand" />
        <Paragraph fontSize={13} fontWeight="700" color="$color">
          Geri Bildirim Ver
        </Paragraph>
      </XStack>
    </Pressable>
  );
}
