import { ReactElement, useCallback } from 'react';
import { Linking, Pressable } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Paragraph, XStack, YStack, useTheme } from 'tamagui';
import { useCartCount } from '@/features/cart/api/cart.queries';
import { BRAND_COLOR } from '@/lib/theme/colors';

type TabItem = {
  label: string;
  path: '/' | '/categories' | '/favorites' | '/cart' | '/profile';
  icon: (props: { color: string; focused: boolean; size: number }) => ReactElement;
};

function HomeTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.75L12 4l9 5.75v8.25a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 18V9.75z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CategoriesTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h16M4 12h16M4 18h7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FavoritesTabIcon({
  color,
  focused,
  size,
}: {
  color: string;
  focused: boolean;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={focused ? color : 'none'}>
      <Path
        d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CartTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-2 4m14-4l2 4M6 17h12"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WhatsappTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 448 512" fill={color}>
      <Path d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.3-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z" />
    </Svg>
  );
}

function ProfileTabIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TAB_ITEMS: readonly TabItem[] = [
  { label: 'Anasayfa', path: '/', icon: ({ color, size }) => <HomeTabIcon color={color} size={size} /> },
  { label: 'Kategoriler', path: '/categories', icon: ({ color, size }) => <CategoriesTabIcon color={color} size={size} /> },
  { label: 'Favorilerim', path: '/favorites', icon: ({ color, focused, size }) => <FavoritesTabIcon color={color} focused={focused} size={size} /> },
  { label: 'Sepetim', path: '/cart', icon: ({ color, size }) => <CartTabIcon color={color} size={size} /> },
  { label: 'Hesabım', path: '/profile', icon: ({ color, size }) => <ProfileTabIcon color={color} size={size} /> },
] as const;

function normalizePathname(pathname: string) {
  return pathname.replace(/^\/\(tabs\)/, '') || '/';
}

function isTabActive(pathname: string, path: TabItem['path']) {
  if (path === '/') return pathname === '/' || pathname.startsWith('/kategori');
  if (path === '/cart') return pathname === '/cart' || pathname.startsWith('/checkout');
  if (path === '/profile') {
    return [
      '/profile',
      '/gezdiklerim',
      '/orders',
      '/order',
      '/order-cancel',
      '/return-create',
      '/coupons',
      '/reviews',
      '/user-info',
      '/change-password',
      '/addresses',
      '/address-form',
      '/payment-methods',
      '/payment-method-form',
      '/bank-account',
      '/agreements',
      '/help',
    ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function BottomNavigationBar() {
  const router = useRouter();
  const pathname = normalizePathname(usePathname());
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const cartCount = useCartCount();
  const inactiveColor = theme.color10.val;

  const navigate = useCallback(
    (path: TabItem['path']) => {
      if (path === '/') {
        router.replace(path);
        return;
      }

      if (isTabActive(pathname, path)) return;
      router.push(path);
    },
    [pathname, router],
  );

  const openWhatsapp = useCallback(() => {
    Linking.openURL('https://wa.me/905327805100?text=Merhaba').catch((error) => {
      console.warn('Failed to open WhatsApp:', error);
    });
  }, []);

  return (
    <XStack
      alignItems="flex-start"
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      height={56 + insets.bottom}
      paddingBottom={insets.bottom + 4}
      paddingTop={6}
    >
      {TAB_ITEMS.slice(0, 4).map((item) => {
        const focused = isTabActive(pathname, item.path);
        const color = focused ? BRAND_COLOR : inactiveColor;
        const showBadge = item.path === '/cart' && cartCount > 0;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            key={item.path}
            onPress={() => navigate(item.path)}
            style={({ pressed }) => ({
              alignItems: 'center',
              flex: 1,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <YStack alignItems="center" gap={2} position="relative">
              {item.icon({ color, focused, size: 25 })}
              {showBadge ? (
                <XStack
                  alignItems="center"
                  backgroundColor="$brand"
                  borderRadius={10}
                  height={18}
                  justifyContent="center"
                  minWidth={18}
                  paddingHorizontal={5}
                  position="absolute"
                  right={-12}
                  top={-5}
                >
                  <Paragraph color="white" fontSize={10} fontWeight="700" lineHeight={12}>
                    {cartCount}
                  </Paragraph>
                </XStack>
              ) : null}
              <Paragraph fontSize={9.5} fontWeight="600" lineHeight={13} style={{ color }}>
                {item.label}
              </Paragraph>
            </YStack>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityLabel="Whatsapp"
        accessibilityRole="button"
        onPress={openWhatsapp}
        style={({ pressed }) => ({
          alignItems: 'center',
          flex: 1,
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <YStack alignItems="center" gap={2}>
          <WhatsappTabIcon color={inactiveColor} size={25} />
          <Paragraph fontSize={9.5} fontWeight="600" lineHeight={13} style={{ color: inactiveColor }}>
            Whatsapp
          </Paragraph>
        </YStack>
      </Pressable>

      {TAB_ITEMS.slice(4).map((item) => {
        const focused = isTabActive(pathname, item.path);
        const color = focused ? BRAND_COLOR : inactiveColor;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            key={item.path}
            onPress={() => navigate(item.path)}
            style={({ pressed }) => ({
              alignItems: 'center',
              flex: 1,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <YStack alignItems="center" gap={2}>
              {item.icon({ color, focused, size: 25 })}
              <Paragraph fontSize={9.5} fontWeight="600" lineHeight={13} style={{ color }}>
                {item.label}
              </Paragraph>
            </YStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}
