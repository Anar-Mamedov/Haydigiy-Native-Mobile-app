import { AnalyticsContext } from './analytics-sink';
import { AnalyticsEvent, AnalyticsProduct } from '../types/analytics.types';
import { AnalyticsEventDto } from '@/services/analytics.service';

/**
 * Domain event → kendi collector'ımızın DTO'su.
 *
 * Event adları web `src/lib/analytics.ts` ile birebir aynı tutulur; aynı
 * ClickHouse tablosuna yazıldığı için mobil ve web aynı isimle raporlanabilsin.
 * Web'de karşılığı olmayan event'ler (`payment_result`, `filter_applied`,
 * `cart_cleared`) mobilde yeni isim alır — AGENTS.md'nin istediği ticaret
 * sözlüğünü tamamlamak için.
 */

/**
 * ClickHouse kolonları tam sayı bekliyor (`nullable|integer`). Sayısal olmayan
 * kimlik gönderilirse backend 422 döndürür, bu yüzden sınırda düşürülür — ham
 * değer `properties` içinde korunur.
 */
export function toIntOrNull(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

/**
 * Uygulama trafiği ClickHouse'ta tarayıcı trafiğinden ayırt edilebilsin.
 *
 * ⚠️ ÇAPRAZ REPO SÖZLEŞMESİ: Backend bu etiketin `"HaydiGiy App"` ile
 * başlamasına GÜVENİYOR (`AnalyticsEventMap::isAppEvent` /
 * `APP_CLIENT_PREFIX`). GA4 ve Meta'ya yalnızca uygulama event'leri iletilir;
 * web tarayıcısı event'ini gtag.js/fbevents.js ile kendisi gönderdiği için
 * ayrım yapılmazsa her web dönüşümü iki kez sayılır.
 *
 * Bu önek değişirse backend de aynı anda değişmek zorundadır — aksi halde
 * uygulama event'leri GA4/Meta'ya sessizce hiç gitmez.
 */
export function buildClientLabel(context: AnalyticsContext): string {
  return context.appVersion ? `HaydiGiy App ${context.appVersion}` : 'HaydiGiy App';
}

function productProperties(product: AnalyticsProduct): Record<string, unknown> {
  return {
    product_name: product.name,
    currency: product.currency,
    // Kimlik sayısal değilse kolona yazılamıyor; ham hali burada kalır.
    raw_product_id: product.id,
    ...(product.variantId ? { raw_variant_id: product.variantId } : {}),
    ...(product.category ? { category_name: product.category } : {}),
    ...(product.brand ? { brand: product.brand } : {}),
  };
}

function productColumns(product: AnalyticsProduct): Partial<AnalyticsEventDto> {
  return {
    product_id: toIntOrNull(product.id),
    variant_id: toIntOrNull(product.variantId),
    category_id: product.categoryId ?? null,
    price: product.price,
    quantity: product.quantity ?? 1,
  };
}

function itemsProperty(products: AnalyticsProduct[]): Record<string, unknown>[] {
  return products.map((product) => ({
    product_id: product.id,
    variant_id: product.variantId ?? null,
    name: product.name,
    price: product.price,
    quantity: product.quantity ?? 1,
  }));
}

function totalQuantity(products: AnalyticsProduct[]): number {
  return products.reduce((sum, product) => sum + (product.quantity ?? 1), 0);
}

/** Event'e özgü alanlar. Bağlamdan gelen ortak alanlar `toEventDto` içinde eklenir. */
function toEventFields(event: AnalyticsEvent): Partial<AnalyticsEventDto> & { event_name: string } {
  switch (event.name) {
    case 'screen_viewed':
      return { event_name: 'page_viewed', page_url: event.screen };

    case 'product_viewed':
      return {
        event_name: 'product_viewed',
        ...productColumns(event.product),
        properties: productProperties(event.product),
      };

    case 'category_viewed':
      return {
        event_name: 'category_viewed',
        category_id: event.categoryId,
        properties: event.categoryName ? { category_name: event.categoryName } : {},
      };

    case 'search_performed':
      return {
        event_name: 'search_performed',
        properties: { query: event.query, result_count: event.resultCount ?? null },
      };

    case 'filter_applied':
      return { event_name: 'filter_applied', properties: { filters: event.filters } };

    case 'add_to_cart':
      return {
        event_name: 'add_to_cart',
        ...productColumns(event.product),
        properties: productProperties(event.product),
      };

    case 'remove_from_cart':
      return {
        event_name: 'remove_from_cart',
        ...productColumns(event.product),
        properties: productProperties(event.product),
      };

    case 'cart_cleared':
      return { event_name: 'cart_cleared', quantity: event.itemCount };

    case 'add_to_wishlist':
      return {
        event_name: 'add_to_wishlist',
        ...productColumns(event.product),
        properties: productProperties(event.product),
      };

    case 'remove_from_wishlist':
      return {
        event_name: 'remove_from_wishlist',
        product_id: toIntOrNull(event.productId),
        properties: { raw_product_id: event.productId },
      };

    case 'checkout_started':
      return {
        event_name: 'checkout_started',
        revenue: event.revenue,
        quantity: totalQuantity(event.products),
        properties: { currency: event.currency, items: itemsProperty(event.products) },
      };

    case 'payment_result':
      return {
        event_name: 'payment_result',
        order_id: toIntOrNull(event.orderId),
        properties: {
          status: event.status,
          ...(event.orderId ? { raw_order_id: event.orderId } : {}),
          ...(event.reason ? { reason: event.reason } : {}),
        },
      };

    case 'purchase_completed':
      return {
        event_name: 'purchase_completed',
        order_id: toIntOrNull(event.orderId),
        revenue: event.revenue,
        quantity: totalQuantity(event.products),
        properties: {
          currency: event.currency,
          raw_order_id: event.orderId,
          items: itemsProperty(event.products),
        },
      };

    case 'user_signed_up':
      return { event_name: 'user_signed_up' };

    case 'user_logged_in':
      return {
        event_name: 'user_logged_in',
        properties: event.method ? { login_method: event.method } : {},
      };

    case 'user_logged_out':
      return {
        event_name: 'user_logged_out',
        properties: event.reason ? { logout_reason: event.reason } : {},
      };
  }
}

export function toFirstPartyEventDto(
  event: AnalyticsEvent,
  context: AnalyticsContext,
): AnalyticsEventDto {
  const fields = toEventFields(event);

  return {
    anonymous_id: context.anonymousId,
    session_id: context.sessionId,
    user_id: context.userId,
    device_id: context.deviceId,
    device_type: context.deviceType,
    os: `${context.os} ${context.osVersion}`.trim(),
    browser: buildClientLabel(context),
    screen_width: context.screenWidth,
    screen_height: context.screenHeight,
    // Ekrana özgü `page_url` varsa (screen_viewed) o kazanır; yoksa aktif ekran.
    page_url: context.screenPath,
    ...fields,
  };
}
