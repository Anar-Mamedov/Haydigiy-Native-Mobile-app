import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { HeaderBackButton } from '@/components/ui/header-back-button';

interface FavoritesHeaderProps {
  onBack: () => void;
}

export function FavoritesHeader({ onBack }: FavoritesHeaderProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      paddingHorizontal="$4"
      height={56}
      width="100%"
      justifyContent="center"
      position="relative"
    >
      <XStack position="absolute" left={4} zIndex={10}>
        <HeaderBackButton onPress={onBack} />
      </XStack>
      <Paragraph fontSize={17} fontWeight="700" color="$color">
        Favorilerim
      </Paragraph>
    </XStack>
  );
}
