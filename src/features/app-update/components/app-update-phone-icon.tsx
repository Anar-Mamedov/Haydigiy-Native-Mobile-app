import { Image } from 'expo-image';

type AppUpdatePhoneIconProps = {
  size?: number;
};

const ICON_ASPECT_RATIO = 133 / 256;

/** Optimized phone + download artwork supplied for the update card. */
export function AppUpdatePhoneIcon({ size = 56 }: AppUpdatePhoneIconProps) {
  return (
    <Image
      accessibilityLabel="Uygulama güncelleme simgesi"
      accessible
      contentFit="contain"
      source={require('../../../../assets/images/app-update-phone.png')}
      style={{ height: size, width: size * ICON_ASPECT_RATIO }}
      testID="app-update-phone-icon"
    />
  );
}
