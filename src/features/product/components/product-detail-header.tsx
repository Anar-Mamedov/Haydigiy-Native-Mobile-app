import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Grid, Search, ShoppingCart, UserRound } from '@/components/ui/icons';
import { XStack, useTheme } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { IconWithCountBadge } from '@/components/ui/count-badge';
import { IconButton, MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { useCartCount } from '@/features/cart/api/cart.queries';
import { Pressable } from 'react-native';

type ProductDetailHeaderProps = {
  /** Geri gidecek ekran yoksa ana sayfaya dönen geri işlemi (controller'dan gelir). */
  onBack: () => void;
};

/** Görünen arama kutusunun yüksekliği; dokunma alanı bunun etrafında 48dp'dir. */
const SEARCH_PILL_HEIGHT = 36;

export function ProductDetailHeader({ onBack }: ProductDetailHeaderProps) {
  const router = useRouter();
  const cartCount = useCartCount();
  const theme = useTheme();

  // Theme-token-derived colors (no raw literals).
  const headerBg = theme.background.val;
  const borderBottomColor = theme.borderColor.val;
  const iconColor = theme.color.val;
  const searchBg = theme.backgroundHover.val;

  // Beş ikon 48dp dokunma alanıyla yan yana durduğu için kenar ve grup boşlukları dar tutulur.
  return (
    <XStack
      alignItems="center"
      backgroundColor={headerBg as any}
      borderBottomColor={borderBottomColor as any}
      borderBottomWidth={1}
      height={56}
      justifyContent="space-between"
      paddingHorizontal="$1.5"
      gap="$1"
      width="100%"
    >
      <IconButton accessibilityLabel="Geri dön" onPress={onBack}>
        <ArrowLeft color={iconColor as any} size={22} />
      </IconButton>

      {/* Shortcuts: Home & Categories */}
      <XStack alignItems="center">
        <IconButton accessibilityLabel="Ana sayfa" onPress={() => router.push('/')}>
          <Home color={iconColor as any} size={20} />
        </IconButton>
        <IconButton accessibilityLabel="Kategoriler" onPress={() => router.push('/categories')}>
          <Grid color={iconColor as any} size={20} />
        </IconButton>
      </XStack>

      {/* Fake Search Input (Tapping navigates to suggestions) */}
      <Pressable
        accessibilityLabel="Ürün ve kategori ara"
        accessibilityRole="search"
        onPress={() => router.push('/search-suggestions')}
        style={{ flex: 1, justifyContent: 'center', minHeight: MIN_TOUCH_TARGET, minWidth: 0 }}
      >
        <XStack
          alignItems="center"
          backgroundColor={searchBg as any}
          borderRadius={8}
          gap={6}
          height={SEARCH_PILL_HEIGHT}
          paddingHorizontal={10}
        >
          <Search color="$color10" size={16} />
          <Paragraph color="$color10" flexShrink={1} fontSize={13} numberOfLines={1}>
            Ürün ve kategori ara
          </Paragraph>
        </XStack>
      </Pressable>

      {/* Right side: Cart and Profile */}
      <XStack alignItems="center">
        <IconButton accessibilityLabel="Sepetim" onPress={() => router.push('/cart')}>
          <IconWithCountBadge
            badgeTestID="product-header-cart-badge"
            count={cartCount}
            icon={<ShoppingCart color={iconColor as any} size={22} />}
          />
        </IconButton>

        <IconButton accessibilityLabel="Hesabım" onPress={() => router.push('/profile')}>
          <UserRound color={iconColor as any} size={22} />
        </IconButton>
      </XStack>
    </XStack>
  );
}
