import { useCallback, useState } from 'react';
import { postNotifyStock } from '@/services/notify-stock.service';

/** Domain modelinde varyant id'si string; backend sayı bekliyor. */
function toVariantId(variantId: string | undefined): number | null {
  if (!variantId) return null;

  const parsed = Number(variantId);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * "Gelince Haber Ver" akışının durumu. Talep gönderilen varyantlar oturum
 * boyunca hatırlanır; aynı bedene tekrar istek gönderilmesini engeller.
 *
 * Not: sepet API'si `pivotId` isterken stok bildirimi varyantın kendi id'sini
 * alıyor — web tarafı da böyle çalışıyor.
 */
export function useNotifyStock() {
  const [notifiedVariantIds, setNotifiedVariantIds] = useState<string[]>([]);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const isVariantNotified = useCallback(
    (variantId: string | undefined) => Boolean(variantId) && notifiedVariantIds.includes(variantId!),
    [notifiedVariantIds],
  );

  const requestNotification = useCallback(async (variantId: string | undefined) => {
    const numericId = toVariantId(variantId);
    if (numericId === null || !variantId) return;

    setIsNotifying(true);
    try {
      await postNotifyStock(numericId);
      setNotifiedVariantIds((current) =>
        current.includes(variantId) ? current : [...current, variantId],
      );
      setIsConfirmationOpen(true);
    } catch (error) {
      console.warn('[NotifyStock] Stok bildirimi talebi gönderilemedi.', error);
      throw error;
    } finally {
      setIsNotifying(false);
    }
  }, []);

  return {
    closeConfirmation: useCallback(() => setIsConfirmationOpen(false), []),
    isConfirmationOpen,
    isNotifying,
    isVariantNotified,
    requestNotification,
  };
}
