import { useRouter, usePathname } from 'expo-router';
import { Heart, Menu, ShoppingCart, UserRound, Search } from '@/components/ui/icons';
import { Button, Theme, XStack, YStack, useTheme, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
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
            tintColor={isDark ? theme.color.val : undefined}
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
                      backgroundColor="$brand"
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
