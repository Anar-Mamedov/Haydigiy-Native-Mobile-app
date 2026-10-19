import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { IconButton } from '@/components/ui/icon-button';
import { MessageCircle, X } from '@/components/ui/icons';
import type { AssistantTexts } from '@/types/assistant.types';

type AssistantHeaderProps = {
  texts: AssistantTexts;
  /** Geri: sohbet korunur (webdeki "küçült"). */
  onBack: () => void;
  /** X: sohbet ve asistan oturumu tamamen kapatılır (README §3-d). */
  onClose: () => void;
};

const AVATAR_SIZE = 36;

export function AssistantHeader({ texts, onBack, onClose }: AssistantHeaderProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      gap="$2"
      minHeight={56}
      paddingRight="$1"
      testID="assistant-header"
    >
      <HeaderBackButton onPress={onBack} />
      <YStack
        alignItems="center"
        backgroundColor="$brand"
        borderRadius={AVATAR_SIZE / 2}
        height={AVATAR_SIZE}
        justifyContent="center"
        width={AVATAR_SIZE}
      >
        <MessageCircle color="white" size={20} />
      </YStack>
      <YStack flex={1}>
        <Paragraph accessibilityRole="header" color="$color" fontSize={16} fontWeight="700" numberOfLines={1}>
          {texts.title}
        </Paragraph>
        <Paragraph color="$color11" fontSize={12} numberOfLines={1}>
          {texts.subtitle}
        </Paragraph>
      </YStack>
      <IconButton accessibilityLabel={texts.close_label} onPress={onClose} testID="assistant-close">
        <X color="$color" size={22} />
      </IconButton>
    </XStack>
  );
}
