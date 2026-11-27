import { Linking } from 'react-native';
import { STORE_PICKUP_MAP_URL } from '../data/store-pickup-location';

/**
 * Mağaza konumunu sistemde açar (Google Haritalar uygulaması ya da tarayıcı). Açılamazsa
 * ekran bozulmaz; uyarı loglanır.
 */
export function openStorePickupMap() {
  Linking.openURL(STORE_PICKUP_MAP_URL).catch((error) =>
    console.warn('Mağaza konumu açılamadı:', error),
  );
}
