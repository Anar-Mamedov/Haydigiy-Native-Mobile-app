import { Pressable } from 'react-native';
import { type ColorTokens, XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';

/** Visible height of the button body; the touch area around it stays at least 48dp. */
const COMPACT_BUTTON_HEIGHT = 36;

export type CompactButtonProps = {
  label: string;
  onPress: () => void;
  /** Fill of the button body. */
  backgroundColor: ColorTokens;
  /** Label color; must stay readable on `backgroundColor` in both themes. */
  color: ColorTokens;
  accessibilityLabel?: string;
  /** Shows progress (e.g. "Gönderiliyor...") and ignores presses while true. */
  busy?: boolean;
  testID?: string;
};

/**
 * Small filled button for an action inside a card or banner (e.g. "Doğrula" in the e-mail
 * warning), matching the web's `px-4 py-2` buttons. `AppButton` keeps its own body at 48dp,
 * which is too tall for these rows; here the body is 36dp and the transparent pressable
 * around it carries the 48dp touch target instead.
 */
export function CompactButton({
  accessibilityLabel,
  backgroundColor,
  busy = false,
  color,
  label,
  onPress,
  testID,
}: CompactButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => ({
        justifyContent: 'center',
        minHeight: MIN_TOUCH_TARGET,
        minWidth: MIN_TOUCH_TARGET,
        opacity: pressed ? 0.85 : 1,
      })}
      testID={testID}
    >
      <XStack
        alignItems="center"
        backgroundColor={backgroundColor}
        borderRadius="$3"
        height={COMPACT_BUTTON_HEIGHT}
        justifyContent="center"
        opacity={busy ? 0.6 : 1}
        paddingHorizontal={16}
      >
        <Paragraph color={color} fontSize={14} fontWeight="500" numberOfLines={1}>
          {label}
        </Paragraph>
      </XStack>
    </Pressable>
  );
}
