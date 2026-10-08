import { XStack, YStack } from 'tamagui';
import { AppSwitch } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AnnouncementOption } from '../constants/announcement-options';

type AnnouncementPreferenceRowProps = {
  option: AnnouncementOption;
  value: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

/** Tek duyuru kanalı: başlık, açıklama ve açma/kapama anahtarı. */
export function AnnouncementPreferenceRow({ option, value, disabled = false, onToggle }: AnnouncementPreferenceRowProps) {
  return (
    <XStack alignItems="center" gap="$4" opacity={disabled ? 0.6 : 1} paddingVertical="$4">
      <YStack flex={1} gap="$1">
        <Paragraph color="$color" fontSize={15} fontWeight="700">
          {option.label}
        </Paragraph>
        <Paragraph color="$color10" fontSize={13} lineHeight={19}>
          {option.description}
        </Paragraph>
      </YStack>
      <AppSwitch
        accessibilityLabel={option.label}
        onValueChange={() => {
          if (!disabled) onToggle();
        }}
        testID={`announcement-switch-${option.channel}`}
        value={value}
      />
    </XStack>
  );
}
