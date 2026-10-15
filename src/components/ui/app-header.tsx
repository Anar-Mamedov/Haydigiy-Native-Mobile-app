import { useRouter, usePathname } from 'expo-router';
import { Heart, Menu, ShoppingCart, UserRound, Search } from '@/components/ui/icons';
import { Button, XStack, useTheme, useThemeName } from 'tamagui';
import { IconWithCountBadge } from '@/components/ui/count-badge';
import { IconButton, MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { useCartCount } from '@/features/cart/api/cart.queries';
import { Image } from 'expo-image';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartCount();
  const theme = useTheme();
  const themeName = useThemeName();

  const isDark = themeName === 'dark' || themeName.includes('dark');

  // Theme-token-derived surface colors (no raw literals): the light header reads
  // as a subtle elevated gray and the dark header keeps the base surface.
  const headerBg = isDark ? theme.background.val : theme.backgroundHover.val;
  const borderBottomColor = theme.borderColor.val;
  const iconColor = theme.color.val;

  // The web mobile header logic: homepage vs subpages
  const isHomePage = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';

  const handleMenuPress = () => {
    router.push('/categories');
  };

  const handleLogoPress = () => {
    if (!isHomePage) {
      router.push('/');
    }
  };

  const handleAccountPress = () => {
    router.push('/profile');
  };

  const handleFavoritesPress = () => {
    router.push('/favorites');
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const handleSearchPress = () => {
    router.push('/categories');
  };

  return (
    <XStack
      alignItems="center"
      backgroundColor={headerBg as any}
      borderBottomColor={borderBottomColor as any}
      borderBottomWidth={1}
      height={56}
      justifyContent="space-between"
      paddingHorizontal="$1.5"
      width="100%"
    >
      {/* Left side: Hamburger menu and Image Logo */}
      <XStack alignItems="center" gap="$1.5">
        <IconButton accessibilityLabel="Kategoriler" onPress={handleMenuPress}>
          <Menu color={iconColor as any} size={24} />
        </IconButton>
        <Button
          accessibilityLabel="Ana sayfa"
          backgroundColor="transparent"
          chromeless
          onPress={handleLogoPress}
          padding={0}
          height={MIN_TOUCH_TARGET}
          width={128}
          justifyContent="flex-start"
          alignItems="center"
          pressStyle={{ opacity: 0.7 }}
        >
          <Image
            source={require('../../../assets/images/hg-logo.svg')}
            style={{ width: 115, height: 32 }}
            contentFit="contain"
            tintColor={isDark ? theme.color.val : undefined}
          />
        </Button>
      </XStack>

      {/* Right side: context-aware action buttons */}
      <XStack alignItems="center">
        {isHomePage ? (
          <>
            <IconButton accessibilityLabel="Hesabım" onPress={handleAccountPress}>
              <UserRound color={iconColor as any} size={22} />
            </IconButton>

            <IconButton accessibilityLabel="Favorilerim" onPress={handleFavoritesPress}>
              <Heart color={iconColor as any} size={22} />
            </IconButton>

            <IconButton accessibilityLabel="Sepetim" onPress={handleCartPress}>
              <IconWithCountBadge
                badgeTestID="header-cart-badge"
                count={cartCount}
                icon={<ShoppingCart color={iconColor as any} size={22} />}
                testID="header-cart-icon"
              />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton accessibilityLabel="Ürün ara" onPress={handleSearchPress}>
              <Search color={iconColor as any} size={22} />
            </IconButton>

            <IconButton accessibilityLabel="Favorilerim" onPress={handleFavoritesPress}>
              <Heart color={iconColor as any} size={22} />
            </IconButton>
          </>
        )}
      </XStack>
    </XStack>
  );
}
