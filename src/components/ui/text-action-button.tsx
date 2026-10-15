import { ReactNode } from 'react';
import { type AccessibilityState, Pressable, type ViewStyle } from 'react-native';
import { type ColorTokens, XStack } from 'tamagui';
import { Paragraph, type ParagraphProps } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';

export type TextActionButtonProps = {
  /** Görünen yazı; ayrıca bir etiket verilmezse ekran okuyucu da bunu okur. */
  label: string;
  onPress: () => void;
  /** Yazının (ve ikonların çağıranın verdiği rengin) teması; iki temada okunur bir token verilmeli. */
  color: ColorTokens;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link';
  accessibilityState?: AccessibilityState;
  /** Dikey bir listede (YStack) kutunun tüm genişliğe yayılmayıp yazı kadar kalması için `flex-start`. */
  alignSelf?: ViewStyle['alignSelf'];
  fontSize?: number;
  fontWeight?: ParagraphProps['fontWeight'];
  /** Yazının önündeki küçük ikon. */
  icon?: ReactNode;
  /** Yazının ardındaki küçük ikon (ok, kamera vb.). */
  iconAfter?: ReactNode;
  underline?: boolean;
  paddingHorizontal?: number;
  testID?: string;
};

/**
 * Tek başına duran yazılı aksiyon ("Beden Tablosu", "Devamını Gör", "12 Değerlendirme"). Yazı
 * küçük kalabilir, ama dokunma alanı en az 48dp yüksekliğinde ve genişliğindedir: `hitSlop`
 * erişilebilirlik taramasına görünmediği için alanı kutunun kendisi taşır. Paragraf içinde akan
 * bağlantılar için `InlineTextLink` kullanılır.
 */
export function TextActionButton({
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  alignSelf,
  color,
  fontSize = 12,
  fontWeight = '700',
  icon,
  iconAfter,
  label,
  onPress,
  paddingHorizontal,
  testID,
  underline = false,
}: TextActionButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => ({
        alignSelf,
        justifyContent: 'center',
        minHeight: MIN_TOUCH_TARGET,
        minWidth: MIN_TOUCH_TARGET,
        opacity: pressed ? 0.6 : 1,
        paddingHorizontal,
      })}
      testID={testID}
    >
      <XStack alignItems="center" gap="$1" justifyContent="center">
        {icon}
        <Paragraph
          color={color}
          fontSize={fontSize}
          fontWeight={fontWeight}
          textAlign="center"
          textDecorationLine={underline ? 'underline' : 'none'}
        >
          {label}
        </Paragraph>
        {iconAfter}
      </XStack>
    </Pressable>
  );
}
