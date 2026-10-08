import { type Href, useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { AppScreen, ScreenHeader } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import {
  STORE_PICKUP_HOW_IT_WORKS,
  STORE_PICKUP_STEPS,
} from '../data/store-pickup';
import { StorePickupBenefits } from '../components/store-pickup-benefits';
import { StorePickupHero } from '../components/store-pickup-hero';
import { StorePickupStepCard } from '../components/store-pickup-step-card';

const HOME_ROUTE = '/' as Href;

/**
 * "Mağazadan Al" (web `/subeden-al`): Niğde mağazasından ücretsiz teslim alma
 * tanıtımı. Statik içerik; uzaktan veri olmadığı için yükleme/hata durumu yok.
 */
export function StorePickupScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(HOME_ROUTE);
    }
  };

  // Ana sayfa sekmesine dön; yığında yoksa onunla değiştir.
  const handleStartShopping = () => router.dismissTo(HOME_ROUTE);

  return (
    <AppScreen backgroundColor="$color2" header={<ScreenHeader onBack={handleBack} title="Mağazadan Al" />}>
      <StorePickupHero onStartShopping={handleStartShopping} />

      <YStack gap="$2">
        <Paragraph color="$brand" fontSize={12} fontWeight="800" letterSpacing={1.2} textTransform="uppercase">
          {STORE_PICKUP_HOW_IT_WORKS.eyebrow}
        </Paragraph>
        <Paragraph accessibilityRole="header" color="$color" fontSize={22} fontWeight="900">
          {STORE_PICKUP_HOW_IT_WORKS.title}
        </Paragraph>
        <Paragraph color="$color11" fontSize={14} lineHeight={21}>
          {STORE_PICKUP_HOW_IT_WORKS.description}
        </Paragraph>
      </YStack>

      <YStack gap="$3">
        {STORE_PICKUP_STEPS.map((step) => (
          <StorePickupStepCard key={step.number} step={step} />
        ))}
      </YStack>

      <StorePickupBenefits />
    </AppScreen>
  );
}
