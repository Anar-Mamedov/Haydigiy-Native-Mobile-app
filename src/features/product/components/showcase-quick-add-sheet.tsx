import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { formatCurrency } from '@/utils/format-currency';
import { ShowcaseQuickAddController } from '../hooks/use-showcase-quick-add';
import { useNotifyStock } from '../hooks/use-notify-stock';
import { NotifyStockDialog } from './notify-stock-dialog';
import { SizeSelectionSheet } from './size-selection-sheet';

type ShowcaseQuickAddSheetProps = {
  controller: ShowcaseQuickAddController;
};

/**
 * Vitrin "Sepete Ekle" beden seçimi. Yalnızca açıkken mount edilir; kargo tahmini ve
 * stok bildirimi ana sayfa açılışında değil, alt sayfa açılınca istenir.
 */
export function ShowcaseQuickAddSheet({ controller }: ShowcaseQuickAddSheetProps) {
  const shippingQuery = useShippingEstimateQuery();
  const notify = useNotifyStock();
  const { activeProduct, detail, pricing, selectedVariant } = controller;

  if (!activeProduct || !pricing) return null;

  return (
    <>
      <SizeSelectionSheet
        discountRate={pricing.discountRate}
        featureIcons={detail?.featureIcons}
        firstPrice={pricing.firstPrice}
        hasDiscount={pricing.hasDiscount}
        imageUrl={activeProduct.imageUrl ?? detail?.imageUrl ?? ''}
        isApprovedForSale={detail?.isApprovedForSale ?? true}
        isLoadingVariants={controller.isLoadingVariants}
        isNotified={notify.isVariantNotified(selectedVariant?.id)}
        isNotifying={notify.isNotifying}
        onClose={controller.close}
        onConfirm={controller.confirm}
        onNotifyMe={() => {
          // Hata da başarı da hook'un dialogunda gösteriliyor.
          void notify.requestNotification(selectedVariant?.id);
        }}
        onSelectVariant={controller.setSelectedVariant}
        open
        price={pricing.price}
        priceLabel={formatCurrency(pricing.price)}
        productName={detail?.title ?? activeProduct.title}
        productPricing={detail ?? undefined}
        selectedVariant={selectedVariant}
        shippingMessage={shippingQuery.data?.message}
        variants={detail?.variants ?? []}
      />
      <NotifyStockDialog
        errorMessage={notify.errorMessage}
        onOpenChange={notify.closeConfirmation}
        open={notify.isConfirmationOpen}
      />
    </>
  );
}
