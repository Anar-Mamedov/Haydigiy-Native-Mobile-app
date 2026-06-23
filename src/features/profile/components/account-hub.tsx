import { Alert } from 'react-native';
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
  Palette,
  RotateCcw,
  ShieldCheck,
  Ticket,
  UserRound,
} from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { AppButton, SectionCard, ThemeToggle } from '@/components/ui';
import { useAppTheme } from '@/lib/theme/use-app-theme';
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
 * personalized links, account & help links, contact, appearance and logout.
 * The user identity is shown in the screen header (AccountHeader). Sections
 * without a mobile screen yet surface a "coming soon" notice.
 */
export function AccountHub({ onLogout }: AccountHubProps) {
  const router = useRouter();
  const { setThemePreference, themePreference } = useAppTheme();

  const showPending = () => {
    Alert.alert('Yakında', 'Bu bölüm yakında eklenecek.');
  };

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
      onPress: showPending,
    },
    {
      icon: <Landmark color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Banka Hesabımız',
      onPress: showPending,
    },
    {
      icon: <FileText color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Sözleşmeler',
      onPress: showPending,
    },
  ];

  const helpItems = [
    {
      icon: <CircleHelp color="$purple10" size={MENU_ICON_SIZE} />,
      label: 'Yardım & Sıkça Sorulan Sorular',
      onPress: showPending,
    },
  ];

  return (
    <YStack gap="$4" paddingBottom="$4">
      <AccountQuickActions actions={quickActions} />
      <AccountOrdersCard actions={orderActions} />
      <AccountMenuCard items={accountItems} title="Hesabım" />
      <AccountMenuCard items={helpItems} />
      <AccountContactCard />

      {/* Appearance / Theme */}
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
