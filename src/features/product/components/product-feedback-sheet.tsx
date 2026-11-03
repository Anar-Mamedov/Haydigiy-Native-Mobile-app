import { CustomerFeedbackSheet } from '@/features/customer-feedback/components/customer-feedback-sheet';
import { useCustomerFeedbackV2Enabled } from '@/features/customer-feedback/hooks/use-customer-feedback-v2';
import { FeedbackModal } from './product-detail-modals';

type ProductFeedbackSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productSlug: string;
};

const toProductId = (id: string): number | null => (/^\d{1,15}$/.test(id) ? Number(id) : null);

/**
 * Ürün detayındaki "Geri Bildirim Ver": customer_feedback_v2 açıksa site geneli yeni form (ürün kimliğiyle),
 * kapalıysa eski sabit kategorili sheet (`POST /product-feedback`) aynen açılır.
 */
export function ProductFeedbackSheet({ open, onOpenChange, productId, productSlug }: ProductFeedbackSheetProps) {
  const useNewForm = useCustomerFeedbackV2Enabled();

  return useNewForm ? (
    <CustomerFeedbackSheet onOpenChange={onOpenChange} open={open} productId={toProductId(productId)} />
  ) : (
    <FeedbackModal onOpenChange={onOpenChange} open={open} productId={productId} productSlug={productSlug} />
  );
}
