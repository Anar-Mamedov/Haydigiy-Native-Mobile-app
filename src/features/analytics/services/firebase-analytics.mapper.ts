import { AnalyticsEvent, AnalyticsProduct } from '../types/analytics.types';
import { FirebaseAnalyticsParams } from '@/lib/firebase-analytics';

/**
 * Domain event → GA4 (Firebase Analytics) komutu.
 *
 * Event seti bilinçli olarak backend'in Measurement Protocol ile GA4'e
 * ilettiği setle birebir aynı (connect `AnalyticsEventMap::GA4_EVENTS`):
 * - Uygulama GA4'e kendi stream'inden göndermeye geçtiğinde raporlar aynı
 *   event adlarıyla sürer.
 * - Backend `ga4_native` işaretli event'leri GA4'e tekrar iletmez; bu sette
 *   olmayan bir event'i burada atlamak, o event'i GA4'ten tamamen düşürmek
 *   olurdu. Sete ekleme/çıkarma iki tarafta birlikte yapılmalı.
 *
 * GA4'te karşılığı olmayan event'ler (`filter_applied`, `cart_cleared`,
 * `remove_from_wishlist`, `payment_result`, `user_logged_out`) gönderilmez.
 */

/** GA4 standart mülklerde parametre değerini 100 karakterde keser. */
export const GA4_MAX_PARAM_VALUE_LENGTH = 100;

export type FirebaseAnalyticsCommand =
  | { kind: 'screen_view'; screenName: string; screenClass: string }
  | { kind: 'event'; name: string; params: FirebaseAnalyticsParams };

function clip(value: string): string {
  return value.length > GA4_MAX_PARAM_VALUE_LENGTH
    ? value.slice(0, GA4_MAX_PARAM_VALUE_LENGTH)
    : value;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toGa4Item(product: AnalyticsProduct): FirebaseAnalyticsParams {
  return {
    item_id: product.id,
    item_name: clip(product.name),
    price: product.price,
    quantity: product.quantity ?? 1,
    ...(product.variantId ? { item_variant: product.variantId } : {}),
    ...(product.category ? { item_category: clip(product.category) } : {}),
    ...(product.brand ? { item_brand: clip(product.brand) } : {}),
  };
}

/** Tek ürünlü ticaret event'leri: tutar, kullanıcının gördüğü birim fiyat × adet. */
function singleProductEvent(name: string, product: AnalyticsProduct): FirebaseAnalyticsCommand {
  return {
    kind: 'event',
    name,
    params: {
      currency: product.currency,
      value: roundMoney(product.price * (product.quantity ?? 1)),
      items: [toGa4Item(product)],
    },
  };
}

export function toFirebaseAnalyticsCommand(event: AnalyticsEvent): FirebaseAnalyticsCommand | null {
  switch (event.name) {
    case 'screen_viewed': {
      // Rota kalıbı (`/product/[id]`) düşük kardinaliteli ekran adı verir; somut yol
      // (`/product/123`) GA4 raporlarını "(other)" satırına taşırdı.
      const screenName = clip(event.route ?? event.screen);
      return { kind: 'screen_view', screenName, screenClass: screenName };
    }

    case 'product_viewed':
      return singleProductEvent('view_item', event.product);

    case 'category_viewed':
      return {
        kind: 'event',
        name: 'view_item_list',
        params: {
          item_list_id: String(event.categoryId),
          ...(event.categoryName ? { item_list_name: clip(event.categoryName) } : {}),
        },
      };

    case 'search_performed':
      return { kind: 'event', name: 'search', params: { search_term: clip(event.query) } };

    case 'add_to_cart':
      return singleProductEvent('add_to_cart', event.product);

    case 'remove_from_cart':
      return singleProductEvent('remove_from_cart', event.product);

    case 'add_to_wishlist':
      return singleProductEvent('add_to_wishlist', event.product);

    case 'checkout_started':
      return {
        kind: 'event',
        name: 'begin_checkout',
        params: {
          currency: event.currency,
          value: roundMoney(event.revenue),
          items: event.products.map(toGa4Item),
        },
      };

    case 'purchase_completed':
      return {
        kind: 'event',
        name: 'purchase',
        params: {
          // GA4 aynı `transaction_id`'yi bir kez sayar; tekrar açılan başarı ekranı geliri şişirmez.
          transaction_id: event.orderId,
          currency: event.currency,
          value: roundMoney(event.revenue),
          items: event.products.map(toGa4Item),
        },
      };

    case 'user_signed_up':
      return { kind: 'event', name: 'sign_up', params: {} };

    case 'user_logged_in':
      return {
        kind: 'event',
        name: 'login',
        params: event.method ? { method: event.method } : {},
      };

    case 'filter_applied':
    case 'cart_cleared':
    case 'remove_from_wishlist':
    case 'payment_result':
    case 'user_logged_out':
      return null;
  }
}
