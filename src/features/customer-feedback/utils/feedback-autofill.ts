import type { FeedbackCategory } from '@/types/customer-feedback.types';

/**
 * Otomatik doldurma (sözleşme v1.1 §1). Ürün ekranından açılan formda ürün zaten bilinir: `text` +
 * `product` alanı hiç sorulmaz, doğrulanmaz ve gönderilmez. Başka yerden açılınca normal sorulur.
 * Uygulamada site adresi olmadığından `page_url` alanı boş kalır (bilinmiyorsa boş, §1.1).
 */

export const hasKnownProduct = (productId: number | null | undefined): productId is number =>
  typeof productId === 'number' && Number.isSafeInteger(productId) && productId > 0;

/** Ekranda çizilecek, doğrulanacak ve gönderilecek alanlar; ürün biliniyorsa ürün sorusu düşer. */
export function visibleFeedbackCategory(category: FeedbackCategory | null, productId?: number | null): FeedbackCategory | null {
  if (!category || !hasKnownProduct(productId)) return category;
  const fields = category.fields.filter((field) => field.config.autofill !== 'product');
  return fields.length === category.fields.length ? category : { ...category, fields };
}
