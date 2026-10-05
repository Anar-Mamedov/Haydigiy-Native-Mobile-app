/**
 * İade onay sheet'inin özeti.
 *
 * Kullanıcı iade talebini göndermeden önce hangi ürünü hangi nedenle, hangi yöntemle
 * iade ettiğini görür ve onaylar. Web'deki `returnConfirmSummary` ile aynı kurallar.
 */

import { formatIbanInput, getIbanDigits, normalizeIban } from '@/utils/iban';
import { PaymentMethod, ReturnMethod, ReturnReason } from '@/types/order.types';
import type { OrderItemSelectionRow } from './order-item-groups';

/** Özetin tek satırı — aynı ürünün aynı nedenle iade edilen adetleri tek satırda toplanır. */
export type ReturnConfirmItem = {
  key: string;
  name: string;
  variantName: string;
  imageUrl: string | null;
  quantity: number;
  reasonName: string;
  isGift: boolean;
};

export type ReturnConfirmDetail = { label: string; value: string };

export type ReturnConfirmSummary = {
  items: ReturnConfirmItem[];
  details: ReturnConfirmDetail[];
};

export type ReturnConfirmIban = { iban: string; ibanName: string };

type BuildItemsInput = {
  rows: OrderItemSelectionRow[];
  selectedIds: string[];
  itemReasons: Record<string, number>;
  reasons: ReturnReason[];
};

type PickIbanInput = {
  savedIbans: PaymentMethod[];
  selectedIbanId: number | null;
  /** Elle girilen IBAN'ın `TR` sonrası rakamları. */
  newIban: string;
  newIbanName: string;
};

type BuildDetailsInput = {
  isStorePickup: boolean;
  returnMethod: ReturnMethod;
  /** Hepsijet kurye randevusunun biçimlenmiş tarihi. */
  pickupDateLabel: string | null;
  /** Geri ödeme yöntemi — yalnızca kullanıcıya seçim sunulduğunda gösterilir. */
  refundMethodName: string | null;
  /** İadenin yatacağı hesap — yalnızca IBAN toplanıyorsa dolu. */
  iban: ReturnConfirmIban | null;
  note: string;
};

const RETURN_METHOD_LABELS: Record<ReturnMethod, string> = {
  ptt: 'PTT Kargo Şubesinden Gönder',
  hepsijet: 'Adresimden Randevulu Aldır',
};

/** Seçili ve nedeni girilmiş satırları ekrandaki sırayla özet satırlarına çevirir. */
export function buildReturnConfirmItems({
  rows,
  selectedIds,
  itemReasons,
  reasons,
}: BuildItemsInput): ReturnConfirmItem[] {
  const selected = new Set(selectedIds);
  const reasonNames = new Map(reasons.map((reason) => [reason.id, reason.name]));
  const items = new Map<string, ReturnConfirmItem>();

  rows.forEach((row) => {
    const reasonId = itemReasons[row.expandedId];
    if (!selected.has(row.expandedId) || !reasonId) return;

    const key = `${row.orderItemId}:${reasonId}`;
    const existing = items.get(key);
    if (existing) {
      existing.quantity += row.quantity;
      return;
    }

    items.set(key, {
      key,
      name: row.item.name,
      variantName: row.item.variantName,
      imageUrl: row.item.image,
      quantity: row.quantity,
      reasonName: reasonNames.get(reasonId) ?? '',
      isGift: row.returnStatus === 'gift_product',
    });
  });

  return Array.from(items.values());
}

/** Özette gösterilecek IBAN; gönderimle aynı kural: kayıtlı IBAN varsa seçili olan, yoksa elle girilen. */
export function pickConfirmIban({
  savedIbans,
  selectedIbanId,
  newIban,
  newIbanName,
}: PickIbanInput): ReturnConfirmIban | null {
  if (savedIbans.length === 0) {
    return newIban ? { iban: normalizeIban(newIban), ibanName: newIbanName.trim() } : null;
  }
  const selected = savedIbans.find((method) => method.id === selectedIbanId);
  return selected ? { iban: selected.iban, ibanName: selected.ibanName } : null;
}

/** İade yöntemi, randevu, geri ödeme ve not satırları. */
export function buildReturnConfirmDetails({
  isStorePickup,
  returnMethod,
  pickupDateLabel,
  refundMethodName,
  iban,
  note,
}: BuildDetailsInput): ReturnConfirmDetail[] {
  const details: ReturnConfirmDetail[] = [
    {
      label: 'İade Yöntemi',
      value: isStorePickup ? 'Mağazaya İade' : RETURN_METHOD_LABELS[returnMethod],
    },
  ];

  if (!isStorePickup && returnMethod === 'hepsijet' && pickupDateLabel) {
    details.push({ label: 'Kurye Randevusu', value: pickupDateLabel });
  }
  if (refundMethodName) {
    details.push({ label: 'Geri Ödeme', value: refundMethodName });
  }
  if (iban?.iban) {
    details.push({ label: "İade IBAN'ı", value: formatIbanInput(getIbanDigits(iban.iban)) });
    if (iban.ibanName) details.push({ label: 'IBAN Sahibi', value: iban.ibanName });
  }

  const trimmedNote = note.trim();
  if (trimmedNote) {
    details.push({ label: 'Not', value: trimmedNote });
  }

  return details;
}
