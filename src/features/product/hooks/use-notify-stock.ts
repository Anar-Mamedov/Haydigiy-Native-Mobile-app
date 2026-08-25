import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { postNotifyStock } from '@/services/notify-stock.service';

/** Talep gönderilemediğinde kullanıcıya gösterilecek metin. */
const NOTIFY_STOCK_ERROR_MESSAGE =
  'Bildirim talebiniz gönderilemedi. Lütfen daha sonra tekrar deneyin.';

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
 * Misafir kullanıcı da butonu görür: talep önce beklemeye alınır, kullanıcı
 * giriş ekranına yönlendirilir ve oturum açılır açılmaz istek otomatik gider.
 * Bekleyen talep bilerek hook'un kendi state'inde tutuluyor — böylece talebi
 * hangi ekran başlattıysa onu yalnızca o ekran tamamlar ve web'deki gibi
 * başka bir ürünün ekranında yanlış varyant için tetiklenemez.
 *
 * Not: sepet API'si `pivotId` isterken stok bildirimi varyantın kendi id'sini
 * alıyor — web tarafı da böyle çalışıyor.
 */
export function useNotifyStock() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => Boolean(state.user));
  const [notifiedVariantIds, setNotifiedVariantIds] = useState<string[]>([]);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingVariantId, setPendingVariantId] = useState<string | null>(null);

  const isVariantNotified = useCallback(
    (variantId: string | undefined) => Boolean(variantId) && notifiedVariantIds.includes(variantId!),
    [notifiedVariantIds],
  );

  const sendNotification = useCallback(async (variantId: string, numericId: number) => {
    setIsNotifying(true);
    setErrorMessage(null);
    try {
      await postNotifyStock(numericId);
      setNotifiedVariantIds((current) =>
        current.includes(variantId) ? current : [...current, variantId],
      );
    } catch (error) {
      // Hata sessiz kalmıyor: aynı dialog hata metniyle açılıyor. Giriş sonrası
      // otomatik gönderimde kullanıcı başka bir sekmede olabildiği için kalıcı
      // bir yüzey (dialog) seçildi; geri döndüğünde mesajı görüyor.
      console.warn('[NotifyStock] Stok bildirimi talebi gönderilemedi.', error);
      setErrorMessage(NOTIFY_STOCK_ERROR_MESSAGE);
    } finally {
      setIsConfirmationOpen(true);
      setIsNotifying(false);
    }
  }, []);

  const requestNotification = useCallback(
    async (variantId: string | undefined) => {
      const numericId = toVariantId(variantId);
      if (numericId === null || !variantId) return;

      if (!isAuthenticated) {
        setPendingVariantId(variantId);
        // Profil sekmesi misafire giriş formunu gösteriyor; uygulamadaki
        // "önce giriş yap" akışlarının tamamı buraya yönleniyor.
        router.push('/profile');
        return;
      }

      await sendNotification(variantId, numericId);
    },
    [isAuthenticated, router, sendNotification],
  );

  // Giriş tamamlanır tamamlanmaz bekleyen talebi gönder. Zustand oturumu anında
  // güncellediği için kullanıcı ürüne geri dönmeden önce istek yola çıkar.
  useEffect(() => {
    if (!isAuthenticated || pendingVariantId === null) return;

    const numericId = toVariantId(pendingVariantId);
    setPendingVariantId(null);
    if (numericId === null) return;

    void sendNotification(pendingVariantId, numericId);
  }, [isAuthenticated, pendingVariantId, sendNotification]);

  const closeConfirmation = useCallback(() => {
    setIsConfirmationOpen(false);
    setErrorMessage(null);
  }, []);

  return {
    closeConfirmation,
    /** Dolu olduğunda talep gönderilemedi demektir; dialog hata metnini gösterir. */
    errorMessage,
    isConfirmationOpen,
    isNotifying,
    isVariantNotified,
    requestNotification,
  };
}
