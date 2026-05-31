import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Grid, Search, ShoppingCart, UserRound } from '@tamagui/lucide-icons-2';
import { Button, Theme, XStack, YStack, Paragraph, useTheme, useThemeName } from 'tamagui';
import { useCartStore, calculateCartItemCount } from '@/features/cart/store/use-cart-store';
import { Pressable } from 'react-native';

export function ProductDetailHeader() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const cartCount = calculateCartItemCount(items);
  const theme = useTheme();
  const themeName = useThemeName();

  const isDark = themeName === 'dark' || themeName.includes('dark');
  const headerBg = isDark ? theme.background.val : 'white';
  const borderBottomColor = isDark ? theme.borderColor.val : '#E5E7EB';
  const iconColor = isDark ? 'white' : '#4B5563';

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
          backgroundColor: isDark ? '#2D3748' : '#F3F4F6',
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          gap: 6,
        }}
      >
        <Search color={isDark ? '#9CA3AF' : '#9CA3AF'} size={16} />
        <Paragraph color={isDark ? '#9CA3AF' : '#6B7280'} fontSize={13} numberOfLines={1}>
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
                    <Paragraph color="white" fontSize={10} fontWeight="900" textAlign="center">
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
