import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Check, Copy } from '@/components/ui/icons';

const COPIED_RESET_MS = 1600;

type CopyFieldProps = {
  /** Small caption above the value, e.g. "KUPON KODU". */
  label: string;
  value: string;
  /** Defaults to "<label> kopyala"; override for a more specific announcement. */
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * A read-only value box with a copy button that confirms with a check for a
 * moment. Icon colors are set explicitly so the control stays readable in both
 * light and dark themes.
 */
export function CopyField({ label, value, accessibilityLabel, testID }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <XStack alignItems="center" gap="$2" testID={testID}>
      <YStack
        backgroundColor="$color2"
        borderColor="$brand"
        borderRadius="$3"
        borderWidth={1}
        flex={1}
        paddingHorizontal="$3"
        paddingVertical="$2"
      >
        <Paragraph color="$color10" fontSize={10} fontWeight="600" letterSpacing={0.5}>
          {label}
        </Paragraph>
        <Paragraph color="$color" fontSize={15} fontWeight="800" numberOfLines={1} selectable>
          {value}
        </Paragraph>
      </YStack>
      <Pressable
        accessibilityLabel={accessibilityLabel ?? `${label} kopyala`}
        accessibilityRole="button"
        onPress={handleCopy}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <XStack
          alignItems="center"
          backgroundColor="$brand"
          borderRadius="$3"
          height={48}
          justifyContent="center"
          width={48}
        >
          {copied ? <Check color="white" size={20} /> : <Copy color="white" size={20} />}
        </XStack>
      </Pressable>
    </XStack>
  );
}
