import { toTurkishLowerCase } from '@/utils/turkish-case';

/**
 * "Mağazadan Al" teslimat seçeneğinin mağaza bilgisi (ödeme kargo satırı ve sipariş detayı).
 *
 * GEÇİCİ: adres ve konum bir iş verisi; doğru yeri backend (`cargo_companies` kaydı,
 * panelden düzenlenebilir alanlar). Backend bu alanları kargo listesinde ve sipariş
 * detayında döndürmeye başlayınca bu sabitler kaldırılıp yanıttaki değerler kullanılmalı.
 * Web'de aynı bilgi ayrıca sabit olarak duruyor (HF-66 / HMA-75).
 */

/** Backend'deki `CargoCompany::STORE_PICKUP_CARGO_ID`. */
export const STORE_PICKUP_CARGO_ID = 5;

/** Sipariş detayı kargo firmasının id'sini döndürmediği için ad ile tanınır. */
const STORE_PICKUP_CARGO_NAME = 'mağazadan al';

export const STORE_PICKUP_ADDRESS = 'Selçuk Mah. Gemili Park Karşısı Haydigiy Mağaza';

export const STORE_PICKUP_MAP_URL = 'https://maps.app.goo.gl/9FFKFdVv4tTwyjZKA';

export const STORE_PICKUP_MAP_LINK_LABEL = 'Konum İçin Tıklayın';

export type StorePickupCargoInput = {
  /** Kargo firması id'si; ödemedeki kargo listesinde var, sipariş detayında yok. */
  id?: number | null;
  /** Kargo firması adı ("Mağazadan Al"). */
  name?: string | null;
};

/** Kargo seçeneği ya da siparişin kargo firması "Mağazadan Al" mı. */
export function isStorePickupCargo({ id, name }: StorePickupCargoInput): boolean {
  if (id === STORE_PICKUP_CARGO_ID) return true;
  if (!name) return false;
  return toTurkishLowerCase(name.trim()) === STORE_PICKUP_CARGO_NAME;
}
