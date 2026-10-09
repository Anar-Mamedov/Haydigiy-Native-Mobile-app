import { MissingCase } from '@/types/order.types';

/** Web paritesi: "N bildiriminiz inceleniyor. Toplam X adet ürün için kayıt bulunuyor." */
export function getMissingCasesSummary(cases: MissingCase[]): string {
  const openCount = cases.filter((item) => !item.isResolved).length;
  const missingQuantity = cases.reduce(
    (total, item) => total + item.lines.reduce((sum, line) => sum + line.missingQuantity, 0),
    0,
  );

  const status =
    openCount > 0
      ? `${openCount} bildiriminiz inceleniyor.`
      : 'Eksik ürün bildirimleriniz çözümlendi.';
  return missingQuantity > 0
    ? `${status} Toplam ${missingQuantity} adet ürün için kayıt bulunuyor.`
    : status;
}
