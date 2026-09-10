import { apiClient } from '@/lib/axios';

/**
 * Kendi analytics collector'ımızın uçları. Web `src/lib/analytics.ts` ile aynı
 * endpoint'i kullanır; alan adları backend doğrulamasıyla (ClickHouse kolonları)
 * birebir aynı olmak zorundadır.
 *
 * Uç public'tir (auth gerektirmez) ve `throttle:5000,1` altındadır.
 */

/** Backend `AnalyticsEventController::batch` doğrulamasının izin verdiği alanlar. */
export type AnalyticsEventDto = {
  anonymous_id: string;
  session_id: string;
  event_name: string;
  user_id?: number | null;
  device_id?: string | null;
  page_url?: string | null;
  page_title?: string | null;
  referrer?: string | null;
  product_id?: number | null;
  variant_id?: number | null;
  category_id?: number | null;
  price?: number | null;
  quantity?: number | null;
  order_id?: number | null;
  revenue?: number | null;
  scroll_depth?: number | null;
  time_on_page?: number | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  screen_width?: number | null;
  screen_height?: number | null;
  properties?: Record<string, unknown>;
};

/** Backend tek istekte en fazla 50 event kabul ediyor (`events` => 'max:50'). */
export const ANALYTICS_BATCH_LIMIT = 50;

export async function postAnalyticsEventsBatchDto(events: AnalyticsEventDto[]): Promise<void> {
  await apiClient.post(
    '/analytics/events/batch',
    { events },
    // Ölçüm isteği ağ hatasında kullanıcıya bir şey göstermez; log gürültüsü yapmasın.
    { skipNetworkErrorLog: true },
  );
}
