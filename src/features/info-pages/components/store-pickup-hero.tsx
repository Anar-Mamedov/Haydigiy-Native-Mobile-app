import { XStack, YStack } from 'tamagui';
import { AppButton } from '@/components/ui/app-button';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Building2 } from '@/components/ui/icons';
import { STORE_PICKUP_HERO } from '../data/store-pickup';

type StorePickupHeroProps = {
  onStartShopping: () => void;
};

/**
 * Turuncu tanıtım alanı. Marka rengi iki temada da aynı olduğundan üzerindeki
 * metin ve rozetler her temada beyazdır; okunabilirlik temaya bağlı değildir.
 */
export function StorePickupHero({ onStartShopping }: StorePickupHeroProps) {
  return (
    <YStack backgroundColor="$brand" borderRadius="$7" gap="$4" overflow="hidden" padding="$5">
      <XStack
        alignSelf="flex-start"
        backgroundColor="rgba(255,255,255,0.18)"
        borderRadius={100}
        paddingHorizontal="$3"
        paddingVertical="$1.5"
      >
        <Paragraph color="white" fontSize={13} fontWeight="700">
          {STORE_PICKUP_HERO.badge}
        </Paragraph>
      </XStack>

      <Paragraph accessibilityRole="header" color="white" fontSize={28} fontWeight="900" lineHeight={34}>
        {STORE_PICKUP_HERO.title}
      </Paragraph>
      <Paragraph color="white" fontSize={15} lineHeight={23} opacity={0.92}>
        {STORE_PICKUP_HERO.description}
      </Paragraph>

      <XStack alignItems="center" gap="$3">
        <XStack
          alignItems="center"
          backgroundColor="white"
          borderRadius={100}
          height={56}
          justifyContent="center"
          width={56}
        >
          <Building2 color="$brand" size={28} />
        </XStack>
        <XStack backgroundColor="white" borderRadius={100} paddingHorizontal="$3" paddingVertical="$1.5">
          <Paragraph color="$brand" fontSize={13} fontWeight="700">
            {STORE_PICKUP_HERO.highlight}
          </Paragraph>
        </XStack>
      </XStack>

      <AppButton
        accessibilityLabel={STORE_PICKUP_HERO.cta}
        alignSelf="flex-start"
        backgroundColor="white"
        borderColor="white"
        color="$brand"
        onPress={onStartShopping}
        pressStyle={{ backgroundColor: 'white', borderColor: 'white', opacity: 0.85 }}
      >
        {STORE_PICKUP_HERO.cta}
      </AppButton>
    </YStack>
  );
}
