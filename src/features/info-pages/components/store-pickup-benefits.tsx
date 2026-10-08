import { XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui/section-card';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Check } from '@/components/ui/icons';
import { STORE_PICKUP_BENEFITS } from '../data/store-pickup';

/** "Neden Mağazadan Al?" — avantaj listesi. */
export function StorePickupBenefits() {
  return (
    <SectionCard elevated>
      <YStack gap="$3">
        <Paragraph color="$brand" fontSize={12} fontWeight="800" letterSpacing={1.2} textTransform="uppercase">
          {STORE_PICKUP_BENEFITS.eyebrow}
        </Paragraph>
        <Paragraph accessibilityRole="header" color="$color" fontSize={20} fontWeight="800" lineHeight={26}>
          {STORE_PICKUP_BENEFITS.title}
        </Paragraph>
        <YStack gap="$2.5">
          {STORE_PICKUP_BENEFITS.items.map((benefit) => (
            <XStack alignItems="flex-start" gap="$3" key={benefit}>
              <XStack
                alignItems="center"
                backgroundColor="$brand"
                borderRadius={100}
                height={20}
                justifyContent="center"
                marginTop={1}
                width={20}
              >
                <Check color="white" size={13} strokeWidth={3} />
              </XStack>
              <Paragraph color="$color11" flex={1} fontSize={14} lineHeight={21}>
                {benefit}
              </Paragraph>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </SectionCard>
  );
}
