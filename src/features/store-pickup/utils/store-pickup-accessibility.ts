import type { AccessibilityActionInfo } from 'react-native';
import { STORE_PICKUP_ADDRESS, STORE_PICKUP_MAP_LINK_LABEL } from '../data/store-pickup-location';
import { openStorePickupMap } from './open-store-pickup-map';

const OPEN_STORE_PICKUP_MAP_ACTION = 'openStorePickupMap';

/**
 * Seçilebilir bir satırın içindeki adres ve harita linki ekran okuyucuya ayrı öğe olarak
 * ulaşmaz (satır tek erişilebilirlik öğesi). Adres satırın etiketine eklenir, link de
 * satırın özel eylemi olarak sunulur (iOS "Eylemler", Android TalkBack eylem menüsü).
 */
export const STORE_PICKUP_ACCESSIBILITY_ACTIONS: AccessibilityActionInfo[] = [
  { name: OPEN_STORE_PICKUP_MAP_ACTION, label: STORE_PICKUP_MAP_LINK_LABEL },
];

/** Satırın erişilebilirlik etiketine mağaza adresini ekler. */
export function withStorePickupAddress(accessibilityLabel: string): string {
  return `${accessibilityLabel}. ${STORE_PICKUP_ADDRESS}`;
}

/** Satırın özel eylemi harita eylemiyse mağaza konumunu açar. */
export function handleStorePickupAccessibilityAction(
  actionName: string,
  openMap: () => void = openStorePickupMap,
): void {
  if (actionName === OPEN_STORE_PICKUP_MAP_ACTION) openMap();
}
