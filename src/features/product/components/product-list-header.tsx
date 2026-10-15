import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { IconWithCountBadge } from '@/components/ui/count-badge';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { IconButton } from '@/components/ui/icon-button';
import { ShoppingCart } from '@/components/ui/icons';

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
      paddingHorizontal="$1.5"
      gap="$2"
      height={56}
      width="100%"
      justifyContent="space-between"
    >
      <XStack alignItems="center" gap="$1.5" flex={1} minWidth={0}>
        <HeaderBackButton onPress={onBack} />
        <Paragraph accessibilityRole="header" fontSize={16} fontWeight="700" color="$color" numberOfLines={1} flex={1}>
          {title}
        </Paragraph>
      </XStack>

      <IconButton accessibilityLabel="Sepete git" onPress={onCartPress}>
        <IconWithCountBadge
          badgeTestID="product-list-cart-badge"
          count={cartCount}
          icon={<ShoppingCart color="$color" size={22} />}
        />
      </IconButton>
    </XStack>
  );
}
