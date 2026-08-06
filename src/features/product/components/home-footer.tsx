import { Linking } from 'react-native';
import { Image } from 'expo-image';
import { Mail, MapPin, Phone } from '@/components/ui/icons';
import { Button, Card, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

const paymentLogos = [
  'https://haydigiy.com/troy-logo.png',
  'https://haydigiy.com/maestro-logo.png',
  'https://haydigiy.com/mastercard-logo.png',
  'https://haydigiy.com/visa-logo.png',
  'https://haydigiy.com/visa-electron-logo.png',
  'https://haydigiy.com/american-express-logo.png',
  'https://haydigiy.com/iyzico-logo.png',
];

export function HomeFooter() {
  const handleCall = () => {
    Linking.openURL('tel:+908502590449').catch((err) =>
      console.warn('Failed to make a call:', err)
    );
  };

  const handleMail = () => {
    Linking.openURL('mailto:info@haydigiy.com').catch((err) =>
      console.warn('Failed to send mail:', err)
    );
  };

  const handleEtbis = () => {
    Linking.openURL(
      'https://etbis.ticaret.gov.tr/tr/SiteSorgulamaSonuc?siteId=4ddcf658-9fcf-48fe-a42b-07669a1d1682'
    ).catch((err) => console.warn('Failed to open ETBIS:', err));
  };

  return (
    <YStack gap="$4" marginTop="$5" paddingHorizontal="$2" paddingBottom="$6">
      {/* Contact & Info Cards */}
      <YStack gap="$3">
        <Card borderColor="$borderColor" borderRadius="$4" borderWidth={1} padding="$4">
          <XStack alignItems="center" gap="$3">
            <Phone color="$brand" size={20} />
            <YStack flex={1}>
              <Paragraph fontSize="$2" fontWeight="700">
                Müşteri Hizmetleri:
              </Paragraph>
              <Button
                accessibilityLabel="Call customer service"
                backgroundColor="transparent"
                chromeless
                justifyContent="flex-start"
                onPress={handleCall}
                padding={0}
              >
                <Paragraph color="$color" fontSize="$3" fontWeight="600">
                  +90 850 259 0 449
                </Paragraph>
              </Button>
            </YStack>
          </XStack>
        </Card>

        <Card borderColor="$borderColor" borderRadius="$4" borderWidth={1} padding="$4">
          <XStack alignItems="center" gap="$3">
            <Mail color="$brand" size={20} />
            <YStack flex={1}>
              <Paragraph fontSize="$2" fontWeight="700">
                Geri Bildirim:
              </Paragraph>
              <Button
                accessibilityLabel="Send email"
                backgroundColor="transparent"
                chromeless
                justifyContent="flex-start"
                onPress={handleMail}
                padding={0}
              >
                <Paragraph color="$color" fontSize="$3" fontWeight="600">
                  info@haydigiy.com
                </Paragraph>
              </Button>
            </YStack>
          </XStack>
        </Card>

        <Card borderColor="$borderColor" borderRadius="$4" borderWidth={1} padding="$4">
          <XStack alignItems="flex-start" gap="$3">
            <MapPin color="$brand" size={20} style={{ marginTop: 2 }} />
            <YStack flex={1}>
              <Paragraph fontSize="$2" fontWeight="700">
                Mağaza Adresi:
              </Paragraph>
              <Paragraph color="$color10" fontSize="$2" lineHeight="$3">
                Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127
                Merkez, Niğde
              </Paragraph>
            </YStack>
          </XStack>
        </Card>
      </YStack>

      {/* Payment Logos */}
      <YStack alignItems="center" gap="$3">
        <Paragraph color="$color10" fontSize="$1" fontWeight="600">
          Ödeme Yöntemleri
        </Paragraph>
        <XStack flexWrap="wrap" gap="$3" justifyContent="center">
          {paymentLogos.map((url, idx) => (
            <Image
              contentFit="contain"
              key={idx}
              source={{ uri: url }}
              style={{ height: 24, width: 44 }}
            />
          ))}
        </XStack>
      </YStack>

      {/* Certificates */}
      <XStack alignItems="center" gap="$4" justifyContent="center" marginTop="$2">
        <Button
          accessibilityLabel="ETBIS registration"
          backgroundColor="transparent"
          chromeless
          onPress={handleEtbis}
          padding={0}
        >
          <Image
            contentFit="contain"
            source={{ uri: 'https://haydigiy.com/EtbiseKayitlidir.jpg' }}
            style={{ height: 60, width: 60 }}
          />
        </Button>
      </XStack>
    </YStack>
  );
}
