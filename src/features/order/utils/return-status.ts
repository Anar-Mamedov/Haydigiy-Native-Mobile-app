// Web sipariş detayındaki (m/hesabim/siparislerim/[id]) iade durumu
// yardımcılarının 1:1 portu: durum kodu normalizasyonu, durum çipi etiketi ve
// iade ilerleme çubuğu adımları.

export const RETURN_PROGRESS_STEPS = [
  'İade Beklemede',
  'Kargoya Verildi',
  'İade Ürünü Tarafımıza Ulaştı',
  'İade Onaylandı',
  'Ödeme İadesi Yapıldı',
] as const;

export const RETURN_REJECTED_STEPS = ['İade Beklemede', 'İade Reddedildi'] as const;

const STATUS_NAME_MAP: Record<string, number> = {
  pending: 1,
  approved: 2,
  rejected: 3,
  shipped: 4,
  received: 5,
  completed: 5,
  cancelled: 6,
  canceled: 6,
};

export function normalizeReturnStatus(status: number | string | null | undefined): number | null {
  if (typeof status === 'number') return status;
  if (typeof status === 'string') {
    const lower = status.toLowerCase();
    if (STATUS_NAME_MAP[lower]) return STATUS_NAME_MAP[lower];
    const parsed = Number(lower);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Ödeme iadesi yapılmış (tamamlanmış) iade talebinin durum kodu. */
export const RETURN_COMPLETED_STATUS = 7;

export function isPendingReturn(status: number | string | null | undefined): boolean {
  return normalizeReturnStatus(status) === 1;
}

export type ReturnStatusDetails = {
  /** İade kartının başlığı (ör. "İade Kargoda"). */
  title: string;
  /** Başlık altındaki açıklama; "N ürün için …" cümlesine eklenir. */
  description: string;
};

/** İade talebi kartının başlık/açıklama metni — web `getReturnStatusDetails` ile aynı. */
export function getReturnStatusDetails(
  status: number | string | null | undefined,
): ReturnStatusDetails {
  switch (normalizeReturnStatus(status)) {
    case 3:
      return { title: 'İade Reddedildi', description: 'İade talebiniz reddedildi.' };
    case 4:
      return { title: 'İade Kargoda', description: 'İade ürünleriniz kargo ile yolda.' };
    case 5:
      return { title: 'İade Ürünleri Ulaştı', description: 'İade ürünleriniz tarafımıza ulaştı.' };
    case 2:
      return { title: 'İade Onaylandı', description: 'İade talebiniz onaylandı.' };
    case RETURN_COMPLETED_STATUS:
      return { title: 'İade Tamamlandı', description: 'İade ödemeniz tamamlandı.' };
    case 6:
      return { title: 'İade Talebi İptal Edildi', description: 'İade talebiniz iptal edildi.' };
    default:
      return { title: 'İade Talebi Oluşturuldu', description: 'İade talebiniz işleme alındı.' };
  }
}

/** Ürün kartındaki depo kontrolü çipi (İyi, Defolu, …): backend adı boşsa "İşlem Bekliyor". */
export function getReturnStatusNameLabel(statusName: string | null | undefined): string {
  if (!statusName || statusName.trim() === '') return 'İşlem Bekliyor';
  return statusName.trim();
}

export type ReturnProgress = {
  steps: readonly string[];
  completed: boolean[];
  currentIndex: number;
  isError: boolean;
};

export function getReturnProgress(
  status: number | string | null | undefined,
): ReturnProgress | null {
  const normalized = normalizeReturnStatus(status);
  if (normalized === null) return null;
  if (normalized === 6) return null;
  if (normalized === 3) {
    return { steps: RETURN_REJECTED_STEPS, completed: [true, true], currentIndex: 1, isError: true };
  }

  const stepIndexMap: Record<number, number> = {
    1: 0,
    4: 1,
    5: 2,
    2: 3,
    7: 4,
  };
  const currentIndex = stepIndexMap[normalized];
  if (typeof currentIndex !== 'number') return null;
  const completed = RETURN_PROGRESS_STEPS.map((_, index) => index <= currentIndex);
  return { steps: RETURN_PROGRESS_STEPS, completed, currentIndex, isError: false };
}
