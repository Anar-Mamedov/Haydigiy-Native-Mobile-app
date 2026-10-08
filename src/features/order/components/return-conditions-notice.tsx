import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Info } from '@/components/ui/icons';
import { RETURN_CONDITION_HIGHLIGHTS } from '../data/return-policy-content';

export const RETURN_POLICY_LINK_LABEL = 'Tüm iptal ve iade koşullarını inceleyin';

type ReturnConditionsNoticeProps = {
  /** "Tüm iptal ve iade koşullarını inceleyin" — koşulların tamamını açar. */
  onShowAllConditions: () => void;
};

/**
 * İade oluşturma ekranındaki iade koşulları bilgilendirmesi — web
 * `ReturnConditionsNotice` (HYD-384) portu: dört temel madde ve tüm koşullara
 * giden bağlantı.
 */
export function ReturnConditionsNotice({ onShowAllConditions }: ReturnConditionsNoticeProps) {
  return (
    <YStack
      backgroundColor="$orange2"
      borderColor="$orange6"
      borderRadius="$4"
      borderWidth={1}
      gap="$2"
      padding="$3"
      testID="return-conditions-notice"
    >
      <XStack alignItems="center" gap="$2">
        <Info color="$brand" size={16} />
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          İade Koşulları
        </Paragraph>
      </XStack>

      <YStack gap="$1.5">
        {RETURN_CONDITION_HIGHLIGHTS.map((condition) => (
          <XStack gap="$2" key={condition} paddingLeft="$1">
            <Paragraph color="$color11" fontSize={12} lineHeight={18}>
              •
            </Paragraph>
            <Paragraph color="$color11" flex={1} fontSize={12} lineHeight={18}>
              {condition}
            </Paragraph>
          </XStack>
        ))}
      </YStack>

      <Pressable
        accessibilityLabel={RETURN_POLICY_LINK_LABEL}
        accessibilityRole="link"
        hitSlop={8}
        onPress={onShowAllConditions}
        style={({ pressed }) => ({ alignSelf: 'flex-start', opacity: pressed ? 0.6 : 1 })}
      >
        <Paragraph color="$brand" fontSize={12} fontWeight="600" paddingTop="$1">
          {RETURN_POLICY_LINK_LABEL}
        </Paragraph>
      </Pressable>
    </YStack>
  );
}
