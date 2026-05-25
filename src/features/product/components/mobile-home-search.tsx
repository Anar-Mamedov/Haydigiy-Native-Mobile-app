import { useRouter } from 'expo-router';
import { Search } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, XStack } from 'tamagui';

export function MobileHomeSearch() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/(tabs)/categories');
  };

  return (
    <Button
      accessibilityLabel="Search products or categories"
      backgroundColor="$backgroundHover"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      height={48}
      marginHorizontal={0}
      marginVertical={0}
      onPress={handlePress}
      paddingHorizontal="$3"
      width="100%"
    >
      <XStack alignItems="center" flex={1} gap="$3">
        <Search color="$brand" size={20} />
        <Paragraph color="$color10" fontSize="$3" fontWeight="500">
          Ürün veya kategori ara
        </Paragraph>
      </XStack>
    </Button>
  );
}
