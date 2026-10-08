import { Pressable } from 'react-native';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ArrowLeft, ShoppingCart } from '@/components/ui/icons';

type ProductListHeaderProps = {
  title: string;
  cartCount: number;
  onBack: () => void;
  onCartPress: () => void;
};

/**
 * Ürün listesi üst çubuğu: geri, liste başlığı (kategori/menü adı, arama
 * başlığı ya da "Ürünler") ve sepet rozeti. Ekran dosyası listeleme mantığına
 * odaklansın diye ayrı tutulur.
 */
export function ProductListHeader({ title, cartCount, onBack, onCartPress }: ProductListHeaderProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      paddingHorizontal="$3"
      paddingVertical="$2"
      gap="$2"
      height={56}
      width="100%"
      justifyContent="space-between"
    >
      <XStack alignItems="center" gap="$2" flex={1} minWidth={0}>
        <Pressable
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
        >
          <ArrowLeft color="$color" size={24} />
        </Pressable>
        <Paragraph accessibilityRole="header" fontSize={16} fontWeight="700" color="$color" numberOfLines={1} flex={1}>
          {title}
        </Paragraph>
      </XStack>

      <Pressable
        accessibilityLabel="Sepete git"
        accessibilityRole="button"
        onPress={onCartPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 6, position: 'relative' })}
      >
        <ShoppingCart color="$color" size={22} />
        {cartCount > 0 ? (
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            borderRadius={10}
            height={18}
            justifyContent="center"
            minWidth={18}
            paddingHorizontal={4}
            position="absolute"
            right={-2}
            top={-2}
          >
            <Paragraph
              color="white"
              fontSize={10}
              fontWeight="900"
              includeFontPadding={false}
              lineHeight={18}
              textAlign="center"
              textAlignVertical="center"
            >
              {cartCount > 9 ? '9+' : cartCount}
            </Paragraph>
          </XStack>
        ) : null}
      </Pressable>
    </XStack>
  );
}
