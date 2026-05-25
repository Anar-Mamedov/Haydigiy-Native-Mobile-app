import { H1, Paragraph, YStack } from 'tamagui';
import { AppScreen } from '@/components/ui';

export default function FavoritesRoute() {
  return (
    <AppScreen>
      <YStack alignItems="center" flex={1} justifyContent="center" gap="$3">
        <H1 fontSize="$8">Favorilerim</H1>
        <Paragraph color="$color10">Favori ürünleriniz burada listelenir.</Paragraph>
      </YStack>
    </AppScreen>
  );
}
