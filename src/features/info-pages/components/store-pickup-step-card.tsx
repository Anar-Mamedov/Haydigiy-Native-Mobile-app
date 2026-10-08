import { CreditCard, MessageSquare, Package, Building2 } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui/section-card';
import { Paragraph } from '@/components/ui/app-paragraph';
import { StorePickupStep, StorePickupStepIcon } from '../data/store-pickup';

/** Adım ikonları; web'deki lucide ikonlarının uygulamadaki karşılıkları. */
const STEP_ICONS: Record<StorePickupStepIcon, typeof CreditCard> = {
  card: CreditCard,
  store: Building2,
  message: MessageSquare,
  package: Package,
};

type StorePickupStepCardProps = {
  step: StorePickupStep;
};

/** "Nasıl çalışır?" bölümündeki numaralı adım kartı. */
export function StorePickupStepCard({ step }: StorePickupStepCardProps) {
  const Icon = STEP_ICONS[step.icon];

  return (
    <SectionCard elevated>
      <XStack alignItems="flex-start" gap="$3">
        <XStack
          alignItems="center"
          backgroundColor="$orange3"
          borderRadius="$4"
          height={44}
          justifyContent="center"
          width={44}
        >
          <Icon color="$brand" size={22} />
        </XStack>
        <YStack flex={1} gap="$1">
          <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
            <Paragraph color="$color" flex={1} fontSize={15} fontWeight="700">
              {step.title}
            </Paragraph>
            <Paragraph color="$orange6" fontSize={20} fontWeight="900">
              {step.number}
            </Paragraph>
          </XStack>
          <Paragraph color="$color11" fontSize={13} lineHeight={19}>
            {step.description}
          </Paragraph>
        </YStack>
      </XStack>
    </SectionCard>
  );
}
