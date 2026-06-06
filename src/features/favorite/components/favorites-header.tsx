import { Pressable } from 'react-native';
import { XStack, Paragraph } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons-2';

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
      <XStack position="absolute" left={12} zIndex={10}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
        >
          <ArrowLeft color="$color" size={24} />
        </Pressable>
      </XStack>
      <Paragraph fontSize={17} fontWeight="700" color="$color">
        Favorilerim
      </Paragraph>
    </XStack>
  );
}
