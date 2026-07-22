import { Button, Paragraph, XStack, YStack } from 'tamagui';
import { AppUpdatePhoneIcon } from './app-update-phone-icon';

export type AppUpdateBannerProps = {
  errorMessage: string | null;
  installedVersionLabel: string;
  isOpeningStore: boolean;
  onUpdatePress: () => void;
};

export function AppUpdateBanner({
  errorMessage,
  installedVersionLabel,
  isOpeningStore,
  onUpdatePress,
}: AppUpdateBannerProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius={6}
      borderWidth={1}
      gap={6}
      minHeight={82}
      overflow="hidden"
      paddingHorizontal={10}
      paddingVertical={8}
      style={{ borderCurve: 'continuous', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}
    >
      <YStack
        alignItems="center"
        height={66}
        justifyContent="center"
        position="relative"
        width={56}
      >
        <YStack
          backgroundColor="$backgroundHover"
          borderRadius={42}
          height={84}
          left={-14}
          position="absolute"
          width={84}
        />
        <AppUpdatePhoneIcon size={66} />
      </YStack>

      <YStack flex={1} gap={2} minWidth={0}>
        <Paragraph
          color="$color9"
          fontSize={12}
          fontWeight="400"
          lineHeight={16}
          numberOfLines={1}
        >
          Mevcut Sürüm: {installedVersionLabel}
        </Paragraph>
        <Paragraph
          adjustsFontSizeToFit
          color="$color"
          fontSize={15}
          fontWeight="700"
          lineHeight={19}
          minimumFontScale={0.88}
          numberOfLines={1}
        >
          Uygulamanın yeni bir sürümü var!
        </Paragraph>
        {errorMessage ? (
          <Paragraph
            accessibilityLiveRegion="polite"
            color="$red10"
            fontSize={10}
            lineHeight={13}
            numberOfLines={2}
            role="alert"
            selectable
          >
            {errorMessage}
          </Paragraph>
        ) : null}
      </YStack>

      <Button
        accessibilityHint="Uygulamanın mağaza sayfasını açar"
        accessibilityLabel="Uygulamayı Güncelle"
        backgroundColor="$brand"
        borderRadius={5}
        disabled={isOpeningStore}
        height={34}
        hitSlop={5}
        minWidth={90}
        onPress={onUpdatePress}
        opacity={isOpeningStore ? 0.65 : 1}
        paddingHorizontal={12}
        pressStyle={{ opacity: 0.8 }}
      >
        <Paragraph color="white" fontSize={15} fontWeight="500">
          {isOpeningStore ? 'Açılıyor...' : 'Güncelle'}
        </Paragraph>
      </Button>
    </XStack>
  );
}
