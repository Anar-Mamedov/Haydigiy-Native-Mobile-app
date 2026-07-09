import { useRouter } from 'expo-router';
import { Paragraph } from 'tamagui';
import { AppScreen, ScreenHeader } from '@/components/ui';
import { BankAccountDetails } from '../components/bank-account-details';

/**
 * "Banka Hesabımız" — static screen showing the company's bank-transfer details
 * for EFT/havale payments. No remote data; mirrors the web informational page.
 */
export function BankAccountScreen() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  return (
    <AppScreen header={<ScreenHeader onBack={handleBack} title="Banka Hesabımız" />}>
      <Paragraph color="$color10" fontSize={13} lineHeight={19}>
        Havale/EFT ile ödeme yapmak için aşağıdaki banka hesap bilgilerini kullanabilirsiniz.
      </Paragraph>
      <BankAccountDetails />
    </AppScreen>
  );
}
