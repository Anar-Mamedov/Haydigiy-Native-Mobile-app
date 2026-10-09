import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TriangleAlert } from '@/components/ui/icons';
import { MissingCase, MissingCaseDelivery } from '@/types/order.types';
import { getMissingCasesSummary } from '../utils/missing-items';
import { MissingCaseCard } from './missing-case-card';

type MissingItemsCardProps = {
  cases: MissingCase[];
  onPressProduct: (slug: string) => void;
  onTrackDelivery?: (delivery: MissingCaseDelivery) => void;
};

/** Order-detail summary of missing product/part reports; hidden when there are none. */
export function MissingItemsCard({ cases, onPressProduct, onTrackDelivery }: MissingItemsCardProps) {
  if (cases.length === 0) return null;

  return (
    <YStack
      backgroundColor="$yellow2"
      borderColor="$yellow6"
      borderRadius="$6"
      borderWidth={1}
      overflow="hidden"
      testID="missing-items-card"
    >
      <XStack alignItems="flex-start" gap="$3" padding="$3">
        <XStack
          alignItems="center"
          backgroundColor="$yellow4"
          borderRadius={100}
          height={36}
          justifyContent="center"
          width={36}
        >
          <TriangleAlert color="$yellow11" size={20} />
        </XStack>
        <YStack flex={1} gap="$1">
          <Paragraph color="$yellow12" fontSize={15} fontWeight="700">
            Eksik Ürün Bildirimleri
          </Paragraph>
          <Paragraph color="$yellow11" fontSize={13} lineHeight={18}>
            {getMissingCasesSummary(cases)}
          </Paragraph>
        </YStack>
      </XStack>

      <YStack borderTopColor="$yellow6" borderTopWidth={1} gap="$3" padding="$3">
        {cases.map((missingCase) => (
          <MissingCaseCard
            key={`${missingCase.kind}-${missingCase.id}`}
            missingCase={missingCase}
            onPressProduct={onPressProduct}
            onTrackDelivery={onTrackDelivery}
          />
        ))}
      </YStack>
    </YStack>
  );
}
