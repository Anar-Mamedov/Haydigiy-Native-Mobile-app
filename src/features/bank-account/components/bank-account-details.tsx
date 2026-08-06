import { useEffect, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { BANK_ACCOUNT_DETAILS, BankAccountField } from '../data/bank-account';

const COPIED_RESET_MS = 2000;

/**
 * Read-only list of the company's bank-transfer details (bank, account name,
 * IBAN), mirroring the web `BankAccountDetails`. Each field sits in a tinted,
 * theme-aware row; copyable fields (the IBAN) can be tapped to copy their value
 * to the clipboard with transient "Kopyalandı" feedback.
 */
export function BankAccountDetails() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const handleCopy = async (field: BankAccountField) => {
    await Clipboard.setStringAsync(field.copyValue ?? field.value);
    setCopiedLabel(field.label);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopiedLabel(null), COPIED_RESET_MS);
  };

  return (
    <SectionCard elevated>
      <YStack gap="$2.5">
        {BANK_ACCOUNT_DETAILS.map((field) => {
          const isCopied = copiedLabel === field.label;
          return (
            <XStack
              accessibilityHint={field.copyable ? 'Kopyalamak için dokunun' : undefined}
              accessibilityLabel={field.copyable ? `${field.label} kopyala` : undefined}
              accessibilityRole={field.copyable ? 'button' : undefined}
              alignItems="center"
              backgroundColor="$backgroundHover"
              borderRadius="$4"
              gap="$3"
              key={field.label}
              onPress={field.copyable ? () => handleCopy(field) : undefined}
              paddingHorizontal="$3.5"
              paddingVertical="$3"
              pressStyle={field.copyable ? { opacity: 0.7 } : undefined}
            >
              <YStack flex={1} gap="$1">
                <Paragraph color="$color10" fontSize={12} fontWeight="700">
                  {field.label}
                </Paragraph>
                <Paragraph color="$color" fontSize={15} fontWeight="600">
                  {field.value}
                </Paragraph>
              </YStack>

              {field.copyable ? (
                <XStack alignItems="center" gap="$1.5">
                  {isCopied ? (
                    <>
                      <Check color="$green10" size={16} />
                      <Paragraph color="$green10" fontSize={12} fontWeight="700">
                        Kopyalandı
                      </Paragraph>
                    </>
                  ) : (
                    <Copy color="$brand" size={18} />
                  )}
                </XStack>
              ) : null}
            </XStack>
          );
        })}
      </YStack>
    </SectionCard>
  );
}
