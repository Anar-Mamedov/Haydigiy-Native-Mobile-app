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
  RotateCcw,
  ShieldCheck,
  Ticket,
  UserRound,
} from '@tamagui/lucide-icons-2';
import { Paragraph, YStack } from 'tamagui';
import { AppButton, SectionCard, ThemeToggle } from '@/components/ui';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import { AccountOrdersCard } from './account-orders-card';
import { AccountMenuCard } from './account-menu-card';
import { AccountContactCard } from './account-contact-card';

type AccountHubProps = {
  onLogout: () => void;
};

const MENU_ICON_SIZE = 20;

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

  const orderActions = [
    { icon: <Package color="white" size={24} />, label: 'Tüm\nSiparişlerim', onPress: showPending },
    { icon: <RotateCcw color="white" size={24} />, label: 'İptal ve\nİadeler', onPress: showPending },
    {
      icon: <MessageSquare color="white" size={24} />,
      label: 'Ürün\nDeğerlendirme',
      onPress: showPending,
    },
  ];

  const personalItems = [
    {
      icon: <Heart color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Favorilerim',
      onPress: () => router.push('/(tabs)/favorites'),
    },
    {
      icon: <Eye color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Önceden Gezdiklerim',
      onPress: () => router.push('/(tabs)/gezdiklerim'),
    },
    {
      icon: <Ticket color="$color10" size={MENU_ICON_SIZE} />,
      label: 'İndirim Kuponlarım',
      onPress: showPending,
    },
  ];

  const accountItems = [
    {
      icon: <UserRound color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Kullanıcı Bilgilerim',
      onPress: showPending,
    },
    {
      icon: <ShieldCheck color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Şifre Değişikliği',
      onPress: showPending,
    },
    {
      icon: <MapPin color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Adres Bilgilerim',
      onPress: showPending,
    },
    {
      icon: <CreditCard color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Ödeme Bilgilerim',
      onPress: showPending,
    },
    {
      icon: <Landmark color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Banka Hesabımız',
      onPress: showPending,
    },
    {
      icon: <FileText color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Sözleşmeler',
      onPress: showPending,
    },
    {
      icon: <CircleHelp color="$color10" size={MENU_ICON_SIZE} />,
      label: 'Sıkça Sorulan Sorular',
      onPress: showPending,
    },
  ];

  return (
    <YStack gap="$4" paddingBottom="$4">
      <AccountOrdersCard actions={orderActions} />
      <AccountMenuCard items={personalItems} title="Size Özel" />
      <AccountMenuCard items={accountItems} title="Hesabım & Yardım" />
      <AccountContactCard />

      {/* Appearance / Theme */}
      <SectionCard>
        <YStack gap="$3">
          <Paragraph color="$color" fontSize={17} fontWeight="700">
            Görünüm
          </Paragraph>
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
