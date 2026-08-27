import { useEffect, useState } from 'react';
import { getViewedProducts } from '@/utils/recently-viewed';
import { InsiderProductInput, buildInsiderInput } from '../utils/insider-product.mapper';

/**
 * En son görüntülenen ürünü Insider ürün objesi olarak döndürür.
 *
 * Ana sayfadaki "Son Görüntülenenler" kampanyası ürünlü SDK metodunu gerektiriyor
 * (Insider dokümanında Recently Viewed yalnızca `getSmartRecommendationWithProduct`
 * altında listeleniyor) ama ana sayfada ürün bağlamı yok. Uygulama zaten gezilen
 * ürünleri yerelde tuttuğu için en sonuncusu bağlam olarak kullanılır.
 *
 * Hiç ürün gezilmemişse `null` döner; o kampanya için sorgu hiç çalışmaz.
 */
export function useLastViewedInsiderProduct(): InsiderProductInput | null {
  const [product, setProduct] = useState<InsiderProductInput | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getViewedProducts()
      .then((viewed) => {
        const last = viewed[0];
        if (cancelled || !last) return;

        setProduct(
          buildInsiderInput({
            id: String(last.id),
            imageUrl: last.thumb,
            name: last.name,
            price: Number.parseFloat(last.price ?? '') || 0,
            slug: last.slug,
          }),
        );
      })
      .catch(() => {
        // Yerel kayıt okunamadıysa öneri alanı sessizce boş kalır.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return product;
}
