import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';

const BANNER_ASPECT_RATIO = 1080 / 130;
const BANNER_CATEGORY_SLUG = '100-tl-alti-tum-urunler';

/**
 * Static cart promo banner (same asset as the web cart) that deep-links to the
 * "100 TL altı" category, mirroring the web `CartBanner`.
 */
export function CartBanner() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel="100 TL altı tüm ürünler"
      accessibilityRole="button"
      onPress={() => router.push(`/(tabs)/kategori/${BANNER_CATEGORY_SLUG}` as never)}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, width: '100%' })}
    >
      <YStack
        borderColor="$borderColor"
        borderRadius="$4"
        borderWidth={1}
        overflow="hidden"
        width="100%"
      >
        <Image
          contentFit="cover"
          source={require('../../../../assets/images/sepet-banner.png')}
          style={{ width: '100%', aspectRatio: BANNER_ASPECT_RATIO }}
        />
      </YStack>
    </Pressable>
  );
}
