import { useMemo } from 'react';
import { InfiniteData, QueryClient, useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../api/product.keys';
import { Product, ProductColorOption } from '@/types/product.types';

/** Arama/kategori listesinin bir sayfası; yalnızca ürün kartları okunur. */
type CachedListPage = { products?: Product[] };

function isSameProduct(candidate: Pick<Product, 'id' | 'slug'>, idOrSlug: string): boolean {
  return candidate.slug === idOrSlug || String(candidate.id) === idOrSlug;
}

function isSameColor(color: ProductColorOption, idOrSlug: string): boolean {
  return color.slug === idOrSlug || String(color.id) === idOrSlug;
}

function findInListCache(queryClient: QueryClient, idOrSlug: string): ProductColorOption[] | undefined {
  const lists = queryClient.getQueriesData<InfiniteData<CachedListPage>>({
    queryKey: [...productKeys.all, 'list'],
  });

  for (const [, data] of lists) {
    const pages = Array.isArray(data?.pages) ? data.pages : [];
    for (const page of pages) {
      const card = page?.products?.find((product) => isSameProduct(product, idOrSlug));
      if (card?.otherColors?.length) return card.otherColors;
    }
  }

  return undefined;
}

function findInSiblingDetailCache(queryClient: QueryClient, idOrSlug: string): ProductColorOption[] | undefined {
  const details = queryClient.getQueriesData<Product>({ queryKey: [...productKeys.all, 'detail'] });

  for (const [, detail] of details) {
    const colors = detail?.otherColors;
    if (colors?.some((color) => isSameColor(color, idOrSlug))) return colors;
  }

  return undefined;
}

/**
 * Detay isteği dönmeden önce gösterilebilecek renk seçeneklerini önbellekten bulur (web
 * `initialProduct.other_colors`):
 *
 * 1. Ürün listeden açıldıysa kartın kendi renk listesi.
 * 2. Renk seçiciden açıldıysa, önbellekteki kardeş rengin detayı — aynı modelin renkleri ortak
 *    olduğu için o liste hedef rengi de içerir.
 *
 * Hiçbiri yoksa `undefined` döner; renk seçici tam detay gelince görünür.
 */
export function findPreviewColorOptions(
  queryClient: QueryClient,
  idOrSlug: string,
): ProductColorOption[] | undefined {
  if (!idOrSlug) return undefined;

  return findInListCache(queryClient, idOrSlug) ?? findInSiblingDetailCache(queryClient, idOrSlug);
}

/** Tam detay gelene kadar (`enabled`) önbellekten bilinen renk seçenekleri. */
export function usePreviewColorOptions(idOrSlug: string, enabled: boolean): ProductColorOption[] | undefined {
  const queryClient = useQueryClient();

  return useMemo(
    () => (enabled ? findPreviewColorOptions(queryClient, idOrSlug) : undefined),
    [enabled, idOrSlug, queryClient],
  );
}
