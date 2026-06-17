import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Grid, Search, ShoppingCart, UserRound } from '@tamagui/lucide-icons-2';
import { Button, Theme, XStack, YStack, Paragraph, useTheme } from 'tamagui';
import { useCartCount } from '@/features/cart/api/cart.queries';
import { Pressable } from 'react-native';

export function ProductDetailHeader() {
  const router = useRouter();
  const cartCount = useCartCount();
  const theme = useTheme();

  // Theme-token-derived colors (no raw literals).
  const headerBg = theme.background.val;
  const borderBottomColor = theme.borderColor.val;
  const iconColor = theme.color.val;
  const searchBg = theme.backgroundHover.val;

  return (
    <XStack
      alignItems="center"
      backgroundColor={headerBg as any}
      borderBottomColor={borderBottomColor as any}
      borderBottomWidth={1}
      height={56}
      justifyContent="space-between"
      paddingHorizontal="$3"
      gap="$2"
      width="100%"
    >
      {/* Back Button */}
      <Button
        accessibilityLabel="Go back"
        backgroundColor="transparent"
        chromeless
        circular
        icon={<ArrowLeft color={iconColor as any} size={22} />}
        onPress={() => router.back()}
        pressStyle={{ backgroundColor: '$backgroundPress' }}
        size="$3"
        padding={0}
      />

      {/* Shortcuts: Home & Categories */}
      <XStack alignItems="center" gap="$1.5">
        <Button
          accessibilityLabel="Go to home"
          backgroundColor="transparent"
          chromeless
          circular
          icon={<Home color={iconColor as any} size={20} />}
          onPress={() => router.push('/')}
          pressStyle={{ backgroundColor: '$backgroundPress' }}
          size="$3"
          padding={0}
        />
        <Button
          accessibilityLabel="Go to categories"
          backgroundColor="transparent"
          chromeless
          circular
          icon={<Grid color={iconColor as any} size={20} />}
          onPress={() => router.push('/(tabs)/categories')}
          pressStyle={{ backgroundColor: '$backgroundPress' }}
          size="$3"
          padding={0}
        />
      </XStack>

      {/* Fake Search Input (Tapping navigates to suggestions) */}
      <Pressable
        onPress={() => router.push('/search-suggestions')}
        style={{
          flex: 1,
          height: 36,
          backgroundColor: searchBg,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          gap: 6,
        }}
      >
        <Search color="$color10" size={16} />
        <Paragraph color="$color10" fontSize={13} numberOfLines={1}>
          Ürün ve kategori ara
        </Paragraph>
      </Pressable>

      {/* Right side: Cart and Profile */}
      <XStack alignItems="center" gap="$1">
        <Button
          accessibilityLabel="Shopping Cart"
          backgroundColor="transparent"
          chromeless
          circular
          icon={
            <YStack position="relative">
              <ShoppingCart color={iconColor as any} size={22} />
              {cartCount > 0 ? (
                <XStack
                  alignItems="center"
                  backgroundColor="$brand"
                  borderRadius={9}
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
          onPress={() => router.push('/(tabs)/cart')}
          pressStyle={{ backgroundColor: '$backgroundPress' }}
          size="$3"
        />

        <Button
          accessibilityLabel="My Account"
          backgroundColor="transparent"
          chromeless
          circular
          icon={<UserRound color={iconColor as any} size={22} />}
          onPress={() => router.push('/(tabs)/profile')}
          pressStyle={{ backgroundColor: '$backgroundPress' }}
          size="$3"
        />
      </XStack>
    </XStack>
  );
}
