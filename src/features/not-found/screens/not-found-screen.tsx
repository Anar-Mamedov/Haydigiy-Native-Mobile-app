import { useRouter } from 'expo-router';
import { FileQuestion, Home, Search } from '@/components/ui/icons';
import { H1, H2, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton, AppScreen } from '@/components/ui';

export function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <AppScreen backgroundColor="$background" gap={0} padding={0}>
      <YStack
        alignItems="center"
        flex={1}
        gap="$5"
        justifyContent="center"
        paddingBottom={insets.bottom + 24}
        paddingHorizontal="$5"
        paddingTop="$7"
      >
        <YStack alignItems="center" gap="$4" maxWidth={520} width="100%">
          <YStack alignItems="center" height={128} justifyContent="center" width={128}>
            <YStack
              backgroundColor="$brand"
              borderRadius={64}
              bottom={0}
              left={0}
              opacity={0.1}
              position="absolute"
              right={0}
              top={0}
            />
            <YStack
              backgroundColor="$brand"
              borderRadius={48}
              bottom={16}
              left={16}
              opacity={0.16}
              position="absolute"
              right={16}
              top={16}
            />
            <YStack
              backgroundColor="$brand"
              borderRadius={32}
              bottom={32}
              left={32}
              opacity={0.24}
              position="absolute"
              right={32}
              top={32}
            />
            <FileQuestion accessibilityElementsHidden color="$brand" size={54} />
          </YStack>

          <YStack alignItems="center" gap="$2">
            <H1 color="$color" fontSize={64} lineHeight={68} selectable textAlign="center">
              404
            </H1>
            <H2 color="$color" fontSize={26} lineHeight={32} selectable textAlign="center">
              Sayfa Bulunamadı
            </H2>
            <Paragraph
              color="$color10"
              fontSize={16}
              lineHeight={24}
              maxWidth={420}
              selectable
              textAlign="center"
            >
              Aradığınız ürün, kategori veya sayfa mevcut değil. İçerik kaldırılmış ya da bağlantı
              güncellenmiş olabilir.
            </Paragraph>
          </YStack>
        </YStack>

        <YStack gap="$3" maxWidth={360} width="100%">
          <AppButton
            accessibilityLabel="Ana sayfaya dön"
            backgroundColor="$brand"
            borderColor="$brand"
            color="white"
            icon={Home}
            onPress={() => router.dismissTo('/')}
            pressStyle={{ backgroundColor: '$brand', borderColor: '$brand', opacity: 0.82 }}
            width="100%"
          >
            Ana Sayfaya Dön
          </AppButton>
          <AppButton
            accessibilityLabel="Kategorilere göz at"
            color="$brand"
            icon={Search}
            onPress={() => router.dismissTo('/categories')}
            width="100%"
          >
            Kategorilere Göz At
          </AppButton>
        </YStack>

        <YStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$6"
          borderWidth={1}
          gap="$2"
          maxWidth={420}
          padding="$4"
          width="100%"
        >
          <Paragraph color="$color" fontWeight="700" selectable textAlign="center">
            Yardıma mı ihtiyacınız var?
          </Paragraph>
          <Paragraph color="$color10" fontSize={13} lineHeight={19} selectable textAlign="center">
            Bu sayfaya bir bağlantı üzerinden geldiyseniz Yardım Merkezi’nden bize ulaşabilirsiniz.
          </Paragraph>
          <AppButton
            accessibilityLabel="Yardım Merkezini aç"
            chromeless
            color="$brand"
            onPress={() => router.push('/help')}
            size="$3"
          >
            Yardım Merkezi
          </AppButton>
        </YStack>
      </YStack>
    </AppScreen>
  );
}
