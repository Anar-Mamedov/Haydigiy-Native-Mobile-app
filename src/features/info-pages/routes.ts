import type { Href } from 'expo-router';
import { InfoPageSlug } from './data/info-page.types';

/**
 * Bilgi sayfaları kök Stack'te `/bilgi/{slug}` altındadır (sekme çubuğunun
 * üstünde, ürün detayı gibi). Slug web yoluyla aynıdır; web → app eşlemesi
 * `utils/resolve-deep-link` içindedir. `/bilgi/subeden-al` statik rotası
 * dinamik `[slug]` rotasından önce eşleşir.
 */
export const INFO_PAGES_ROOT = '/bilgi';

export function infoPageRoute(slug: InfoPageSlug): Href {
  return `${INFO_PAGES_ROOT}/${slug}` as Href;
}
