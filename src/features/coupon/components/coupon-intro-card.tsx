import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';

type CouponIntroCardProps = {
  count: number;
};

/** Header card explaining the coupons list, with a count badge when non-empty. */
export function CouponIntroCard({ count }: CouponIntroCardProps) {
  return (
    <SectionCard elevated>
      <XStack alignItems="center" gap="$3" justifyContent="space-between">
        <YStack flex={1} gap="$1">
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            İndirim Kuponlarım
          </Paragraph>
          <Paragraph color="$color10" fontSize={13} lineHeight={18}>
            Kullanmak istediğiniz indirim kuponunu ödeme sayfasında uygulayabilirsiniz.
          </Paragraph>
        </YStack>

        {count > 0 ? (
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            borderRadius={100}
            justifyContent="center"
            minWidth={28}
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            <Paragraph color="white" fontSize={14} fontWeight="800">
              {count}
            </Paragraph>
          </XStack>
        ) : null}
      </XStack>
    </SectionCard>
  );
}
