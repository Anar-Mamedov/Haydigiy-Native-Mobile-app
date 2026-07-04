// Web sipariş detayındaki (hesabim/siparislerim/[id]) iade-engel uyarısının
// birebir kuralları: yalnızca time_expired ve already_requested gösterilir;
// not_delivered ve bilinmeyen nedenler ile henüz ödeme alınmamış taslak
// durumları (status 1, 14) gizlenir.
const RETURN_BLOCK_BANNER_MESSAGES: Record<string, string> = {
  time_expired: 'İade süresi doldu (14 gün)',
  already_requested: 'Bu sipariş için iade talebi oluşturuldu',
};

export type ReturnBlockBannerInput = {
  canCreateReturnRequest: boolean;
  returnBlockReason: string | null;
  statusId: number;
};

/** Sipariş detayında gösterilecek iade-engel metni; gösterilmeyecekse null. */
export function getReturnBlockBannerMessage(
  order: ReturnBlockBannerInput,
  isCancelable: boolean,
): string | null {
  if (isCancelable || order.canCreateReturnRequest) return null;
  if (order.statusId === 1 || order.statusId === 14) return null;
  if (!order.returnBlockReason) return null;
  return RETURN_BLOCK_BANNER_MESSAGES[order.returnBlockReason] ?? null;
}
