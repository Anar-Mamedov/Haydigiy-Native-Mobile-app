import { ReactNode } from 'react';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';

export type AppRadioOption = {
  value: string;
  label: string;
  description?: string | null;
};

export interface AppRadioGroupProps {
  /** Grubun erişilebilir adı (soru ya da başlık). */
  accessibilityLabel: string;
  options: AppRadioOption[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Seçili seçeneğin hemen altında açılan içerik (akordeon; örn. geri bildirim başlığının soruları). */
  renderSelectedContent?: (option: AppRadioOption) => ReactNode;
  testID?: string;
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <YStack
      alignItems="center"
      borderColor={selected ? '$brand' : '$color8'}
      borderRadius={999}
      borderWidth={2}
      height={22}
      justifyContent="center"
      width={22}
    >
      {selected ? <YStack backgroundColor="$brand" borderRadius={999} height={10} width={10} /> : null}
    </YStack>
  );
}

/**
 * Paylaşılan tek seçim grubu. Her satır en az 48dp, ekran okuyucuya `radio` rolü ve seçili durumu
 * bildirilir; metin renkleri bileşenin içinde verildiği için açık ve koyu temada okunur kalır.
 */
export function AppRadioGroup({
  accessibilityLabel,
  options,
  value,
  onChange,
  disabled = false,
  renderSelectedContent,
  testID,
}: AppRadioGroupProps) {
  return (
    <YStack accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" gap="$2" testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <YStack
            backgroundColor={selected ? '$backgroundHover' : '$background'}
            borderColor={selected ? '$brand' : '$borderColor'}
            borderRadius="$4"
            borderWidth={1}
            key={option.value}
            overflow="hidden"
          >
            <XStack
              accessibilityLabel={option.description ? `${option.label}, ${option.description}` : option.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              alignItems="center"
              gap="$3"
              minHeight={MIN_TOUCH_TARGET}
              onPress={() => {
                if (!disabled && !selected) onChange(option.value);
              }}
              opacity={disabled ? 0.6 : 1}
              paddingHorizontal="$3"
              paddingVertical="$2.5"
              pressStyle={disabled ? undefined : { opacity: 0.85 }}
              testID={testID ? `${testID}-${option.value}` : undefined}
            >
              <RadioDot selected={selected} />
              <YStack flex={1} gap="$1">
                <Paragraph color="$color" fontSize={14} fontWeight={selected ? '700' : '500'}>
                  {option.label}
                </Paragraph>
                {option.description ? (
                  <Paragraph color="$color10" fontSize={12}>
                    {option.description}
                  </Paragraph>
                ) : null}
              </YStack>
            </XStack>
            {selected && renderSelectedContent ? (
              <YStack borderTopColor="$borderColor" borderTopWidth={1} padding="$3">
                {renderSelectedContent(option)}
              </YStack>
            ) : null}
          </YStack>
        );
      })}
    </YStack>
  );
}
