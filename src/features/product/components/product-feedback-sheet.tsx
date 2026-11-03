import { CustomerFeedbackSheet } from '@/features/customer-feedback/components/customer-feedback-sheet';
import { PRODUCT_FEEDBACK_CATEGORY_KEY } from '@/features/customer-feedback/constants/feedback-categories';

type ProductFeedbackSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
};

const toProductId = (id: string): number | null => (/^\d{1,15}$/.test(id) ? Number(id) : null);

/**
 * Ürün detayındaki "Geri Bildirim Ver" (sözleşme v1.1 §2): site geneli form "Ürünle İlgili Sorunlar"
 * seçili açılır, ürün kimliği (`product_id`) gönderilir, ürün adı sorusu sorulmaz. Eski sabit
 * kategorili pencere (`POST /product-feedback`) kaldırıldı; tek yol budur.
 */
export function ProductFeedbackSheet({ open, onOpenChange, productId }: ProductFeedbackSheetProps) {
  return (
    <CustomerFeedbackSheet
      initialCategoryKey={PRODUCT_FEEDBACK_CATEGORY_KEY}
      onOpenChange={onOpenChange}
      open={open}
      productId={toProductId(productId)}
    />
  );
}
