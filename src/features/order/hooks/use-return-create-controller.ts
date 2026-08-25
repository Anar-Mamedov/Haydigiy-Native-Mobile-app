import {
  buildOrderItemGroups,
  filterGroupRows,
  findGroupByOrderItemId,
  flattenGroupRows,
  getGroupRowIds,
  getPreselectRowIds,
  type OrderItemGroup,
  type OrderItemSelectionRow,
} from '@/features/order/utils/order-item-groups';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useOrderDetailQuery } from '../api/order.queries';
import {
  usePaymentMethodsQuery,
  useRefundMethodsQuery,
  useReturnReasonsQuery,
} from '../api/return.queries';
import {
  useRecreateReturnAsPttMutation,
  useSubmitReturnRequestMutation,
} from '../api/return.mutations';
import { useRefundMethod } from './use-refund-method';
import { useReturnIban } from './use-return-iban';
import { useScheduledReturn } from './use-scheduled-return';
import { buildReturnBaseMessage, buildReturnSuccessMessage } from '../utils/return-messages';
import { getReturnErrorMessage, SubmitReturnRequestPayload } from '@/services/return.service';
import { ReturnMethod, ReturnPhoto, ReturnSubmitItem } from '@/types/order.types';

export const PHOTO_REQUIRED_REASON_ID = 2;
const IBAN_PAYMENT_METHOD_IDS = [2, 3];

/** İade ekranının kartı: tek ürün ya da içindeki ürünler tek tek seçilebilen paket. */
export type ReturnItemGroup = OrderItemGroup;
/** İade ekranının seçilebilir satırı (bir adet). */
export type ExpandedReturnItem = OrderItemSelectionRow;

type Options = { preselectItemId: number | null; selectAll: boolean; enabled: boolean };

const matchesReason = (name: string, needle: string) =>
  name.trim().toLocaleLowerCase('tr-TR').includes(needle);

/**
 * Orchestrates the return-creation flow (mirrors the web `iade-olustur` screen):
 * per-unit item selection + reason + optional photo, refund IBAN, PTT vs Hepsijet
 * method, the multipart submit, and the Hepsijet→PTT fallback.
 */
export function useReturnCreateController(orderId: string, options: Options) {
  const router = useRouter();
  const detailQuery = useOrderDetailQuery(orderId, options.enabled);
  const reasonsQuery = useReturnReasonsQuery(options.enabled);

  const order = detailQuery.data ?? null;
  const reasons = useMemo(() => reasonsQuery.data ?? [], [reasonsQuery.data]);

  const shouldShowIbanSelect = order
    ? IBAN_PAYMENT_METHOD_IDS.includes(order.paymentMethodId ?? -1)
    : false;
  const paymentMethodsQuery = usePaymentMethodsQuery(options.enabled && shouldShowIbanSelect);
  const paymentMethods = useMemo(
    () => paymentMethodsQuery.data ?? [],
    [paymentMethodsQuery.data],
  );

  const refundMethodsQuery = useRefundMethodsQuery(options.enabled && shouldShowIbanSelect);
  const refundMethods = useMemo(() => refundMethodsQuery.data ?? [], [refundMethodsQuery.data]);
  const refund = useRefundMethod(shouldShowIbanSelect, refundMethods);
  // Hediye çeki seçiliyken IBAN ne sorulur ne de gönderilir. `useReturnIban`
  // yine kapıda ödeme bayrağıyla beslenir; aksi halde yönteme her geçişte
  // kullanıcının girdiği IBAN temizlenirdi.
  const shouldCollectIban = shouldShowIbanSelect && !refund.isGiftVoucher;

  const iban = useReturnIban(shouldShowIbanSelect, paymentMethods);
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>('ptt');
  const scheduled = useScheduledReturn(order, options.enabled && returnMethod === 'hepsijet');
  const submitMutation = useSubmitReturnRequestMutation();
  const recreateMutation = useRecreateReturnAsPttMutation();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemReasons, setItemReasons] = useState<Record<string, number>>({});
  const [itemPhotos, setItemPhotos] = useState<Record<string, ReturnPhoto>>({});
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [focusToken, setFocusToken] = useState(0);
  const appliedTokenRef = useRef(-1);

  const isStorePickup = order?.cargoCompanyName === 'Mağazadan Al';

  /**
   * Ekranda basılan kartlar. Paket tek kartta toplanır ama içindeki her ürün kendi
   * satırıdır: kullanıcı paketten dilediğini iade edebilir. İade edilemeyen satırlar
   * (ör. hijyen ürünü) listeden düşer; paketin kalan ürünleri iade edilebilir kalır.
   */
  const itemGroups = useMemo<ReturnItemGroup[]>(
    () => buildOrderItemGroups(order?.items, order?.displayItems),
    [order?.items, order?.displayItems],
  );

  const returnableGroups = useMemo(
    () => filterGroupRows(itemGroups, (row) => !row.isNonReturnable),
    [itemGroups],
  );
  /** Seçim, neden, fotoğraf ve istek gövdesi hep bu düz satır listesi üzerinden yürür. */
  const returnableRows = useMemo(() => flattenGroupRows(returnableGroups), [returnableGroups]);
  const giftRows = useMemo(
    () => returnableRows.filter((row) => row.returnStatus === 'gift_product'),
    [returnableRows],
  );

  const defaultReasonId = useMemo(() => {
    const match = reasons.find(
      (reason) => matchesReason(reason.name, 'beden büyük geldi') || matchesReason(reason.name, 'beden buyuk geldi'),
    );
    return match?.id ?? null;
  }, [reasons]);

  // Re-apply preselection on each focus (the screen lives in the tab navigator
  // and is not remounted between opens).
  useFocusEffect(
    useCallback(() => {
      setFocusToken((token) => token + 1);
    }, []),
  );

  useEffect(() => {
    if (itemGroups.length === 0) return;
    if (appliedTokenRef.current === focusToken) return;
    appliedTokenRef.current = focusToken;

    const giftIds = giftRows.map((row) => row.expandedId);
    let nextSelected: string[] = [];

    if (options.preselectItemId) {
      // Paket bileşeni açıldıysa paketin tamamı işaretlenir; kullanıcı istemediklerini kaldırır.
      const target = findGroupByOrderItemId(returnableGroups, options.preselectItemId);
      nextSelected = target
        ? Array.from(new Set([...getPreselectRowIds(target), ...giftIds]))
        : [];
    } else if (options.selectAll) {
      nextSelected = returnableRows.map((row) => row.expandedId);
    }

    setSelectedItems(nextSelected);
    setItemReasons(
      defaultReasonId
        ? Object.fromEntries(nextSelected.map((id) => [id, defaultReasonId]))
        : {},
    );
    setItemPhotos({});
  }, [
    focusToken,
    itemGroups,
    returnableGroups,
    returnableRows,
    giftRows,
    options.preselectItemId,
    options.selectAll,
    defaultReasonId,
  ]);

  // Selected units default to the "Beden büyük geldi" reason until changed.
  useEffect(() => {
    if (!defaultReasonId || selectedItems.length === 0) return;
    setItemReasons((prev) => {
      let changed = false;
      const next = { ...prev };
      selectedItems.forEach((id) => {
        if (next[id] == null) {
          next[id] = defaultReasonId;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [defaultReasonId, selectedItems]);

  const toggleItem = useCallback(
    (expandedId: string) => {
      const giftIds = giftRows.map((row) => row.expandedId);
      setSelectedItems((prev) => {
        if (prev.includes(expandedId)) {
          return prev.filter((id) => id !== expandedId);
        }
        return Array.from(new Set([...prev, expandedId, ...giftIds]));
      });
    },
    [giftRows],
  );

  /** Paket başlığındaki kutu: tamamı seçiliyse hepsini kaldırır, değilse hepsini seçer. */
  const toggleGroup = useCallback(
    (groupId: string) => {
      const group = returnableGroups.find((entry) => entry.groupId === groupId);
      if (!group) return;
      const rowIds = getGroupRowIds(group);
      const giftIds = giftRows.map((row) => row.expandedId);

      setSelectedItems((prev) => {
        const allSelected = rowIds.every((id) => prev.includes(id));
        if (allSelected) return prev.filter((id) => !rowIds.includes(id));
        return Array.from(new Set([...prev, ...rowIds, ...giftIds]));
      });
    },
    [returnableGroups, giftRows],
  );

  const setItemReason = useCallback((expandedId: string, reasonId: number) => {
    setItemReasons((prev) => ({ ...prev, [expandedId]: reasonId }));
  }, []);

  const setItemPhoto = useCallback((expandedId: string, photo: ReturnPhoto | null) => {
    setItemPhotos((prev) => {
      const next = { ...prev };
      if (photo) next[expandedId] = photo;
      else delete next[expandedId];
      return next;
    });
  }, []);

  const allSelectedHaveReasons =
    selectedItems.length > 0 && selectedItems.every((id) => itemReasons[id]);
  const missingPhotoIds = selectedItems.filter(
    (id) => itemReasons[id] === PHOTO_REQUIRED_REASON_ID && !itemPhotos[id],
  );
  const isScheduleReady = returnMethod === 'ptt' || scheduled.canSchedule;

  const canSubmit =
    allSelectedHaveReasons &&
    returnableRows.length > 0 &&
    missingPhotoIds.length === 0 &&
    !submitMutation.isPending &&
    // IBAN listesi yalnızca kapıda ödeme siparişlerinde yüklenir; kartlı
    // siparişlerde sorgu devre dışıdır ve devre dışı sorgu sonsuza dek
    // `isPending` kalır — koşulsuz beklemek kartlı iadeleri tamamen kilitler.
    (!shouldShowIbanSelect || !paymentMethodsQuery.isPending) &&
    // Aynı gerekçe iade yöntemi sorgusu için de geçerli.
    (!shouldShowIbanSelect || !refundMethodsQuery.isPending) &&
    (!shouldCollectIban || iban.hasValidForSubmit) &&
    isScheduleReady &&
    !scheduled.pickupSubmitting;

  /**
   * Seçilen satırları iade isteğine çevirir; her satır kendi `order_item` kaydına,
   * kendi iade nedenine ve kendi fotoğrafına karşılık gelir.
   */
  const buildItemsPayload = useCallback((): ReturnSubmitItem[] => {
    return selectedItems.flatMap((expandedId) => {
      const row = returnableRows.find((entry) => entry.expandedId === expandedId);
      const reasonId = itemReasons[expandedId];
      if (!row || !reasonId) return [];

      const photo = reasonId === PHOTO_REQUIRED_REASON_ID ? (itemPhotos[expandedId] ?? null) : null;

      return [
        {
          orderItemId: row.orderItemId,
          quantity: row.quantity,
          returnReasonId: reasonId,
          photo,
        },
      ];
    });
  }, [selectedItems, returnableRows, itemReasons, itemPhotos]);

  const lastReturnRequestId = useMemo(() => {
    const ids = order?.returnRequestIds ?? [];
    return ids.length > 0 ? Math.max(...ids) : null;
  }, [order?.returnRequestIds]);

  const handleSubmit = useCallback(async () => {
    if (!order || !allSelectedHaveReasons) return;
    if (missingPhotoIds.length > 0) {
      setErrorMessage('Fotoğraf istenen ürünler için görsel yüklemelisiniz.');
      return;
    }
    const resolvedIban = shouldCollectIban ? iban.resolveForPayload() : null;
    if (shouldCollectIban && !resolvedIban) return;

    let hepsijetPickupCreated = false;
    if (returnMethod === 'hepsijet') {
      const pickup = await scheduled.submitPickup();
      if (!pickup.success) {
        setErrorMessage(pickup.message || 'Randevu oluşturulamadı. Lütfen tekrar deneyin.');
        return;
      }
      hepsijetPickupCreated = true;
    }

    const payload: SubmitReturnRequestPayload = {
      orderId: order.id,
      cargoCompany: returnMethod,
      note: note.trim() || undefined,
      refundMethodId: shouldShowIbanSelect ? refund.selectedId : undefined,
      iban: resolvedIban?.iban,
      ibanName: resolvedIban?.ibanName,
      items: buildItemsPayload(),
    };

    try {
      const result = await submitMutation.mutateAsync(payload);
      setSuccessMessage(
        buildReturnSuccessMessage({
          cargoCompanyName: order.cargoCompanyName,
          returnMethod,
          code: result.return_code ?? result.code,
          expiresAt: result.expires_at,
          selectedDate: scheduled.selectedDate,
        }),
      );
    } catch (error) {
      let rollbackNote = '';
      if (returnMethod === 'hepsijet' && hepsijetPickupCreated) {
        const cancelResult = await scheduled.cancelPickup();
        if (!cancelResult.success) {
          rollbackNote = `\n\nRandevu iptali yapılamadı: ${cancelResult.message || 'Lütfen müşteri hizmetleriyle iletişime geçin.'}`;
        }
      }
      setErrorMessage(`${getReturnErrorMessage(error)}${rollbackNote}`);
    }
  }, [
    order,
    allSelectedHaveReasons,
    missingPhotoIds.length,
    iban,
    returnMethod,
    scheduled,
    note,
    shouldShowIbanSelect,
    shouldCollectIban,
    refund.selectedId,
    buildItemsPayload,
    submitMutation,
  ]);

  const handleRecreatePtt = useCallback(async () => {
    if (!order) return;
    const resolvedIban = shouldCollectIban ? iban.resolveForPayload() : null;
    if (shouldCollectIban && !resolvedIban) return;

    const payload: SubmitReturnRequestPayload = {
      orderId: order.id,
      cargoCompany: 'ptt',
      note: note.trim() || undefined,
      refundMethodId: shouldShowIbanSelect ? refund.selectedId : undefined,
      iban: resolvedIban?.iban,
      ibanName: resolvedIban?.ibanName,
      items: buildItemsPayload(),
    };

    try {
      const result = await recreateMutation.mutateAsync({
        returnRequestId: lastReturnRequestId,
        payload,
      });
      const code = result.return_code ?? result.code;
      setErrorMessage(null);
      setSuccessMessage(
        lastReturnRequestId
          ? `İade talebiniz başarıyla PTT kargo ile güncellendi.${code ? `\nİade Kodunuz: ${code}` : ''}`
          : buildReturnBaseMessage(code, result.expires_at),
      );
    } catch (error) {
      setErrorMessage(getReturnErrorMessage(error));
    }
  }, [
    order,
    iban,
    note,
    shouldShowIbanSelect,
    shouldCollectIban,
    refund.selectedId,
    buildItemsPayload,
    recreateMutation,
    lastReturnRequestId,
  ]);

  const closeSuccess = useCallback(() => {
    setSuccessMessage(null);
    router.replace('/orders');
  }, [router]);

  return {
    order,
    reasons,
    isLoading: detailQuery.isPending,
    isError: detailQuery.isError,
    refetch: detailQuery.refetch,
    canCreateReturn: order?.canCreateReturnRequest ?? true,
    returnBlockReason: order?.returnBlockReason ?? null,
    isStorePickup,
    itemGroups,
    returnableGroups,
    returnableRows,
    giftRows,
    selectedItems,
    itemReasons,
    itemPhotos,
    toggleItem,
    toggleGroup,
    setItemReason,
    setItemPhoto,
    note,
    setNote,
    returnMethod,
    setReturnMethod,
    shouldShowIbanSelect,
    shouldCollectIban,
    paymentMethods,
    paymentLoading: paymentMethodsQuery.isPending,
    paymentError: paymentMethodsQuery.isError
      ? 'Ödeme bilgileri yüklenirken bir hata oluştu.'
      : null,
    refund,
    refundLoading: shouldShowIbanSelect && refundMethodsQuery.isPending,
    refundError: refundMethodsQuery.isError ? 'İade yöntemleri yüklenemedi.' : null,
    iban,
    scheduled,
    reasonsLoading: reasonsQuery.isPending,
    reasonsError: reasonsQuery.isError ? 'İade nedenleri alınamadı.' : null,
    canSubmit,
    isSubmitting: submitMutation.isPending,
    isRecreating: recreateMutation.isPending,
    successMessage,
    errorMessage,
    clearError: () => setErrorMessage(null),
    handleSubmit,
    handleRecreatePtt,
    closeSuccess,
  };
}
