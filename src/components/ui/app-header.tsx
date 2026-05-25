import { useRouter, usePathname } from 'expo-router';
import { Heart, Menu, ShoppingCart, UserRound, Search } from '@tamagui/lucide-icons-2';
import { Button, Theme, XStack, YStack, Paragraph, useTheme, useThemeName } from 'tamagui';
import { useCartStore, calculateCartItemCount } from '@/features/cart/store/use-cart-store';
import { Image } from 'expo-image';

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const cartCount = calculateCartItemCount(items);
  const theme = useTheme();
  const themeName = useThemeName();

  const isDark = themeName === 'dark' || themeName.includes('dark');

  const headerBg = isDark ? theme.background.val : '#F6F6F6';
  const borderBottomColor = isDark ? theme.borderColor.val : '#E5E7EB';
  const iconColor = isDark ? 'white' : 'black';

  // The web mobile header logic: homepage vs subpages
  const isHomePage = pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/';

  const handleMenuPress = () => {
    router.push('/(tabs)/categories');
  };

  const handleLogoPress = () => {
    if (!isHomePage) {
      router.push('/');
    }
  };

  const handleAccountPress = () => {
    router.push('/(tabs)/profile');
  };

  const handleFavoritesPress = () => {
    router.push('/(tabs)/favorites');
  };

  const handleCartPress = () => {
    router.push('/(tabs)/cart');
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/categories');
  };

  return (
    <XStack
      alignItems="center"
      backgroundColor={headerBg as any}
      borderBottomColor={borderBottomColor as any}
      borderBottomWidth={1}
      height={56}
      justifyContent="space-between"
      paddingHorizontal="$3"
      width="100%"
    >
      {/* Left side: Hamburger menu and Image Logo */}
      <XStack alignItems="center" gap="$2">
        <Button
          accessibilityLabel="Open categories menu"
          backgroundColor="transparent"
          chromeless
          circular
          hoverStyle={{ backgroundColor: '$backgroundHover' }}
          icon={<Menu color={iconColor as any} size={24} />}
          onPress={handleMenuPress}
          pressStyle={{ backgroundColor: '$backgroundPress' }}
          size="$3"
          padding={0}
        />
        <Button
          accessibilityLabel="Go to home"
          backgroundColor="transparent"
          chromeless
          onPress={handleLogoPress}
          padding={0}
          height={32}
          width={128}
          justifyContent="flex-start"
          alignItems="center"
          pressStyle={{ opacity: 0.7 }}
        >
          <Image
            source={require('../../../assets/images/hg-logo.svg')}
            style={{ width: 115, height: 32 }}
            contentFit="contain"
            tintColor={isDark ? 'white' : undefined}
          />
        </Button>
      </XStack>

      {/* Right side: context-aware action buttons */}
      <XStack alignItems="center" gap="$1">
        {isHomePage ? (
          <>
            <Button
              accessibilityLabel="My Account"
              backgroundColor="transparent"
              chromeless
              circular
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              icon={<UserRound color={iconColor as any} size={22} />}
              onPress={handleAccountPress}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              size="$3"
            />

            <Button
              accessibilityLabel="My Favorites"
              backgroundColor="transparent"
              chromeless
              circular
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              icon={<Heart color={iconColor as any} size={22} />}
              onPress={handleFavoritesPress}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              size="$3"
            />

            <Button
              accessibilityLabel="Shopping Cart"
              backgroundColor="transparent"
              chromeless
              circular
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              icon={
                <YStack position="relative">
                  <ShoppingCart color={iconColor as any} size={22} />
                  {cartCount > 0 ? (
                    <XStack
                      alignItems="center"
                      backgroundColor="#f27a1a"
                      borderRadius={10}
                      height={18}
                      justifyContent="center"
                      minWidth={18}
                      paddingHorizontal={4}
                      position="absolute"
                      right={-6}
                      top={-6}
                    >
                      <Theme name="dark">
                        <Paragraph color="white" fontSize={10} fontWeight="900" textAlign="center">
                          {cartCount > 9 ? '9+' : cartCount}
                        </Paragraph>
                      </Theme>
                    </XStack>
                  ) : null}
                </YStack>
              }
              onPress={handleCartPress}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              size="$3"
            />
          </>
        ) : (
          <>
            <Button
              accessibilityLabel="Search products"
              backgroundColor="transparent"
              chromeless
              circular
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              icon={<Search color={iconColor as any} size={22} />}
              onPress={handleSearchPress}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              size="$3"
            />

            <Button
              accessibilityLabel="My Favorites"
              backgroundColor="transparent"
              chromeless
              circular
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              icon={<Heart color={iconColor as any} size={22} />}
              onPress={handleFavoritesPress}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              size="$3"
            />
          </>
        )}
      </XStack>
    </XStack>
  );
}
