import { useEffect, useRef } from 'react';
import { analytics } from '../services/analytics-dispatcher';
import {
  cartItemToAnalyticsProduct,
  productToAnalyticsProduct,
} from '../utils/analytics-product.mapper';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

/**
 * Ekran seviyesindeki ticaret event'leri. Ekranlar yalnızca *ne* oldukları
 * bilgisini verir; tetikleme kuralları (veri gelince, kimlik başına bir kez)
 * burada durur — Insider tarafındaki `use-insider-page-tracking` ile aynı
 * yaklaşım.
 */

/** Ürün detayı yüklendiğinde ürün kimliği başına bir kez `product_viewed`. */
export function useTrackAnalyticsProductView(product: Product | null | undefined): void {
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!product) return;
    if (lastIdRef.current === product.id) return;
    lastIdRef.current = product.id;

    analytics.track({ name: 'product_viewed', product: productToAnalyticsProduct(product) });
  }, [product]);
}

/**
 * Kategori listesi çözüldüğünde kategori başına bir kez `category_viewed`.
 * Arama sonuçları kategori sayılmaz; çağıran taraf o durumda `null` geçer.
 */
export function useTrackAnalyticsCategoryView(
  categoryId: number | null | undefined,
  categoryName?: string,
): void {
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (categoryId === null || categoryId === undefined) return;
    if (lastIdRef.current === categoryId) return;
    lastIdRef.current = categoryId;

    analytics.track({ name: 'category_viewed', categoryId, categoryName });
    // categoryName kasten bağımlılık değil: aynı kategori için ad sonradan
    // gelse bile ikinci bir ziyaret event'i üretilmemeli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);
}

/**
 * Arama sonucu sayısı belli olduğunda sorgu başına bir kez `search_performed`.
 * Sonuç sayısı olmadan gönderilirse "sonuçsuz arama" raporu üretilemez, bu
 * yüzden yükleme bitene kadar (`isReady`) beklenir.
 */
export function useTrackAnalyticsSearch(
  query: string | null | undefined,
  resultCount: number | undefined,
  isReady: boolean,
): void {
  const lastQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = query?.trim();
    if (!trimmed || !isReady) return;
    // Sonuç sayısı sorgudan sonra gelebilir; efekt yeniden çalışır, sorgu
    // bazlı tekilleştirme ikinci event'i engeller.
    if (lastQueryRef.current === trimmed) return;
    lastQueryRef.current = trimmed;

    analytics.track({ name: 'search_performed', query: trimmed, resultCount });
  }, [query, isReady, resultCount]);
}

/**
 * Ödeme ekranı sepet satırlarıyla açıldığında bir kez `checkout_started`.
 *
 * Tutar, web `begin_checkout` ile aynı şekilde **sepet satırlarının toplamı**
 * üzerinden hesaplanır — kargo ve indirim uygulanmış nihai sipariş tutarı
 * değil. Aksi halde aynı huninin iki ucu farklı tabanla raporlanırdı.
 */
export function useTrackAnalyticsCheckoutStarted(items: CartLineItem[]): void {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Sepet satırları ekran açıldıktan sonra gelebiliyor; efekt her yeni
    // satır referansında yeniden çalışır, `hasTrackedRef` tek event garantisi verir.
    if (hasTrackedRef.current || items.length === 0) return;
    hasTrackedRef.current = true;

    const products = items.map(cartItemToAnalyticsProduct);
    const revenue = products.reduce(
      (sum, product) => sum + product.price * (product.quantity ?? 1),
      0,
    );

    analytics.track({ name: 'checkout_started', currency: 'TRY', products, revenue });
  }, [items]);
}

/**
 * Ödeme sonucu ekranı açıldığında bir kez `payment_result`.
 *
 * Bankanın döndürdüğü hata metni bilinçli olarak taşınmaz; sınıflandırılmamış
 * serbest metin raporda işe yaramaz ve kişisel veri sızdırma riski taşır.
 */
export function useTrackAnalyticsPaymentResult(
  status: 'success' | 'failed' | 'pending',
  orderId?: string,
): void {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    analytics.track({ name: 'payment_result', orderId: orderId || undefined, status });
    // Kasten bağımlılıksız: ekran bir kez sonuç bildirir, parametre sonradan
    // değişse bile ikinci event üretilmez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
