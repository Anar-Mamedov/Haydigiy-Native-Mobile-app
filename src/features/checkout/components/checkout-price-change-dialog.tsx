import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/utils/format-currency';

type CheckoutPriceChangeDialogProps = {
  open: boolean;
  message: string;
  updatedTotal: number;
  isPreparingInstallments: boolean;
  canConfirm: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Explicit payment consent shown after the backend reports a new checkout total.
 * The confirm action stays disabled until any refreshed installment plan is ready.
 */
export function CheckoutPriceChangeDialog({
  open,
  message,
  updatedTotal,
  isPreparingInstallments,
  canConfirm,
  onConfirm,
  onCancel,
}: CheckoutPriceChangeDialogProps) {
  const description = isPreparingInstallments
    ? `${message}\n\nGüncel taksit tutarı hesaplanıyor. Onay işlemi kısa süre içinde etkinleşecektir.`
    : `${message}\n\nYeni toplam: ${formatCurrency(updatedTotal)}\n\nYeni fiyatla devam etmek için onaylayın.`;

  return (
    <ConfirmDialog
      cancelLabel="İptal"
      confirmDisabled={!canConfirm || isPreparingInstallments}
      confirmLabel="Onayla"
      description={description}
      descriptionTone="danger"
      onConfirm={onConfirm}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
      open={open}
      title="Fiyat Güncellendi"
    />
  );
}
