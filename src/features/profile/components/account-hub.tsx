import { useRouter } from 'expo-router';
import {
  CreditCard,
  Eye,
  FileText,
  Heart,
  CircleHelp,
  Landmark,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  RotateCcw,
  ShieldCheck,
  Ticket,
  UserRound,
} from '@tamagui/lucide-icons-2';
import { YStack } from 'tamagui';
import { AppButton } from '@/components/ui';
// Temporarily disabled with the appearance card below.
// import { Paragraph, XStack } from 'tamagui';
// import { Palette } from '@tamagui/lucide-icons-2';
// import { SectionCard, ThemeToggle } from '@/components/ui';
// import { useAppTheme } from '@/lib/theme/use-app-theme';
import { AccountOrdersCard } from './account-orders-card';
import { AccountMenuCard } from './account-menu-card';
import { AccountContactCard } from './account-contact-card';
import { AccountQuickActions } from './account-quick-actions';

type AccountHubProps = {
  onLogout: () => void;
};

const MENU_ICON_SIZE = 26;

/**
 * Authenticated "Hesabım" hub mirroring the web account page: order shortcuts,
 * personalized links, account & help links, contact and logout.
 * The user identity is shown in the screen header (AccountHeader).
 */
export function AccountHub({ onLogout }: AccountHubProps) {
  const router = useRouter();
  // Temporarily disabled with the appearance card below.
  // const { setThemePreference, themePreference } = useAppTheme();

  const goToOrders = () => router.push('/(tabs)/orders');

  const quickActions = [
    {
      icon: <Eye color="$brand" size={26} />,
      label: 'Önceden Gezdiklerim',
      onPress: () => router.push('/(tabs)/gezdiklerim'),
    },
    {
      icon: <Ticket color="$brand" size={26} />,
      label: 'İndirim Kuponlarım',
      onPress: () => router.push('/(tabs)/coupons'),
    },
    {
      icon: <Heart color="$brand" size={26} />,
      label: 'Favorilerim',
      onPress: () => router.push('/(tabs)/favorites'),
    },
    {
      icon: <MessageSquare color="$brand" size={26} />,
      label: 'Ürün Değerlendirme',
      onPress: () => router.push('/(tabs)/reviews'),
    },
  ];

  const orderActions = [
    {
      icon: <Package color="$brand" size={24} />,
      label: 'Tüm Siparişlerim',
      onPress: goToOrders,
    },
    {
      icon: <RotateCcw color="$brand" size={24} />,
      label: 'İptal ve İadeler',
      onPress: goToOrders,
    },
  ];

  const accountItems = [
    {
      icon: <UserRound color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Kullanıcı Bilgilerim',
      onPress: () => router.push('/(tabs)/user-info'),
    },
    {
      icon: <ShieldCheck color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Şifre Değişikliği',
      onPress: () => router.push('/(tabs)/change-password'),
    },
    {
      icon: <MapPin color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Adres Bilgilerim',
      onPress: () => router.push('/(tabs)/addresses'),
    },
    {
      icon: <CreditCard color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Ödeme Bilgilerim',
      onPress: () => router.push('/(tabs)/payment-methods'),
    },
    {
      icon: <Landmark color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Banka Hesabımız',
      onPress: () => router.push('/(tabs)/bank-account'),
    },
    {
      icon: <FileText color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Sözleşmeler',
      onPress: () => router.push('/(tabs)/agreements'),
    },
  ];

  const helpItems = [
    {
      icon: <CircleHelp color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Yardım & Sıkça Sorulan Sorular',
      onPress: () => router.push('/(tabs)/help'),
    },
  ];

  return (
    <YStack gap="$4" paddingBottom="$4">
      <AccountQuickActions actions={quickActions} />
      <AccountOrdersCard actions={orderActions} />
      <AccountMenuCard items={accountItems} title="Hesabım" />
      <AccountMenuCard items={helpItems} />
      <AccountContactCard />

      {/*
      Temporarily hidden. Keep this code here so the appearance selector can be
      restored later without rebuilding the section from scratch.

      <SectionCard elevated>
        <YStack gap="$3.5">
          <XStack alignItems="center" gap="$3">
            <XStack
              alignItems="center"
              backgroundColor="$purple3"
              borderRadius="$4"
              height={40}
              justifyContent="center"
              width={40}
            >
              <Palette color="$purple10" size={22} />
            </XStack>
            <YStack flex={1}>
              <Paragraph color="$color" fontSize={16} fontWeight="700">
                Görünüm
              </Paragraph>
              <Paragraph color="$color10" fontSize={12}>
                Uygulama temasını seç
              </Paragraph>
            </YStack>
          </XStack>
          <ThemeToggle onValueChange={setThemePreference} value={themePreference} />
        </YStack>
      </SectionCard>
      */}

      {/* Logout */}
      <AppButton
        backgroundColor="$red3"
        borderColor="$red6"
        borderWidth={1}
        color="$red10"
        icon={LogOut}
        id="profile-logout-btn"
        onPress={onLogout}
        pressStyle={{ backgroundColor: '$red4', opacity: 0.8 }}
      >
        Çıkış Yap
      </AppButton>
    </YStack>
  );
}
