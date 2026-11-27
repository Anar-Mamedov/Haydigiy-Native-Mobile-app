import { XStack } from 'tamagui';
import { MapPin } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { InlineTextLink } from '@/components/ui/inline-text-link';
import { STORE_PICKUP_ADDRESS, STORE_PICKUP_MAP_LINK_LABEL } from '../data/store-pickup-location';
import { openStorePickupMap } from '../utils/open-store-pickup-map';

const ICON_SIZE = 14;

type StorePickupLocationProps = {
  /** Adresin önündeki başlık (ör. "Teslim alma adresi"); verilmezse yalnız adres. */
  label?: string;
  /** Harita linkine basılınca; varsayılanı mağaza konumunu sistemde açar. */
  onPressMap?: () => void;
};

/**
 * "Mağazadan Al" için mağaza adresi ve "Konum İçin Tıklayın" linki. Ödemedeki kargo
 * satırında ve sipariş detayında aynı görünüm kullanılır. Renkler tema değerlerinden
 * geldiği için iki temada da okunur; link vurgusu `InlineTextLink`'te tanımlı.
 */
export function StorePickupLocation({ label, onPressMap = openStorePickupMap }: StorePickupLocationProps) {
  return (
    <XStack alignItems="flex-start" gap="$1.5" paddingTop="$1" testID="store-pickup-location">
      <MapPin color="$brand" size={ICON_SIZE} style={{ marginTop: 1 }} />
      <Paragraph color="$color11" flex={1} fontSize={12} lineHeight={16}>
        {label ? (
          <Paragraph color="$color10" fontSize={12} lineHeight={16}>
            {label}:{' '}
          </Paragraph>
        ) : null}
        {STORE_PICKUP_ADDRESS}.{' '}
        <InlineTextLink onPress={onPressMap}>{STORE_PICKUP_MAP_LINK_LABEL}</InlineTextLink>
      </Paragraph>
    </XStack>
  );
}
