import { buildOrderItemGroups, type OrderItemGroup } from '@/features/order/utils/order-item-groups';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCancellationReasonsQuery, useOrderDetailQuery } from '../api/order.queries';
import {
  usePreviewOrderCancelMutation,
  useSubmitOrderCancelMutation,
} from '../api/order-cancel.mutations';
import { isOrderCancellableStatus } from '../utils/order-status';
import {
  getAcknowledgementRequiredPreview,
  getCancelErrorMessage,
  getCancellationBlockedPreview,
} from '@/services/order.service';
import { CancelItem, CancelPreview} from '@/types/order.types';

/** İptal ekranının satırı: normal ürün ya da tek parça olarak seçilen bundle. */
export type ExpandedCancelItem = OrderItemGroup;

type Options = { preselectItemId: number | null; selectAll: boolean; enabled: boolean };

/**
 * Orchestrates the order cancellation flow: per-unit selection + reason, the
 * `cancel-preview` step, the campaign-break / blocked warning, and the final
 * `cancel` submission — mirroring the web OrderCancellation screen.
 */
export function useOrderCancelController(orderId: string, options: Options) {
  const router = useRouter();
  const detailQuery = useOrderDetailQuery(orderId, options.enabled);
  const reasonsQuery = useCancellationReasonsQuery(options.enabled);
  const previewMutation = usePreviewOrderCancelMutation();
  const submitMutation = useSubmitOrderCancelMutation();

  const order = detailQuery.data;
  const reasons = useMemo(() => reasonsQuery.data ?? [], [reasonsQuery.data]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemReasons, setItemReasons] = useState<Record<string, number>>({});
  const [warningPreview, setWarningPreview] = useState<CancelPreview | null>(null);
  const [pendingItems, setPendingItems] = useState<CancelItem[]>([]);
  const [focusToken, setFocusToken] = useState(0);
  const appliedTokenRef = useRef(-1);

  /**
   * Seçilebilir satırlar. Normal ürünler adet kadar ayrı satıra bölünür; bundle'ın
   * içindeki ürünler TEK satırda toplanır (paket ya bütün iptal edilir ya da hiç).
   */
  const expandedItems = useMemo<ExpandedCancelItem[]>(
    () => buildOrderItemGroups(order?.items, order?.displayItems),
    [order?.items, order?.displayItems],
  );

  const isCancelable = order ? isOrderCancellableStatus(order.status, order.statusId) : false;

  const defaultReasonId = useMemo(() => {
    const match = reasons.find((reason) => {
      const normalized = reason.name.trim().toLocaleLowerCase('tr-TR');
      return normalized.includes('vazgeç') || normalized.includes('vazgec');
    });
    return match?.id ?? null;
  }, [reasons]);

  // The screen lives in the tab navigator and is not remounted between opens, so
  // bump a token on every focus to force the preselection to re-apply.
  useFocusEffect(
    useCallback(() => {
      setFocusToken((token) => token + 1);
    }, []),
  );

  // Apply ?item_id / ?select_all preselection for the current focus once items
  // are loaded. The token guard ensures user toggles and background refetches
  // don't reset the selection mid-session, while each new open resets it.
  useEffect(() => {
    if (expandedItems.length === 0) return;
    if (appliedTokenRef.current === focusToken) return;
    appliedTokenRef.current = focusToken;

    if (options.preselectItemId) {
      // Bundle bileşeni seçildiyse paketin tamamı işaretlenir.
      const target = expandedItems.find((entry) =>
        entry.members.some((member) => member.orderItemId === options.preselectItemId),
      );
      setSelectedIds(target ? [target.expandedId] : []);
    } else if (options.selectAll && isCancelable) {
      setSelectedIds(expandedItems.map((entry) => entry.expandedId));
    } else {
      setSelectedIds([]);
    }
    setItemReasons({});
  }, [focusToken, expandedItems, options.preselectItemId, options.selectAll, isCancelable]);

  // Selected units default to the "Vazgeçtim" reason until the user changes it.
  useEffect(() => {
    if (!defaultReasonId || selectedIds.length === 0) return;
    setItemReasons((prev) => {
      let changed = false;
      const next = { ...prev };
      selectedIds.forEach((id) => {
        if (next[id] == null) {
          next[id] = defaultReasonId;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [defaultReasonId, selectedIds]);

  const toggleSelect = useCallback((expandedId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(expandedId)) {
        setItemReasons((reasonsMap) => {
          const next = { ...reasonsMap };
          delete next[expandedId];
          return next;
        });
        return prev.filter((id) => id !== expandedId);
      }
      return [...prev, expandedId];
    });
  }, []);

  const setReason = useCallback((expandedId: string, reasonId: number) => {
    setItemReasons((prev) => ({ ...prev, [expandedId]: reasonId }));
  }, []);

  /**
   * Seçilen satırları isteğe çevirir. Bundle satırı burada kendi gerçek `order_item`
   * kayıtlarına açılır; paketin tüm bileşenleri aynı iptal nedeniyle gönderilir.
   */
  const buildItems = useCallback(
    (ids: string[], reasonResolver: (id: string) => number | undefined): CancelItem[] =>
      ids.flatMap((id) => {
        const entry = expandedItems.find((item) => item.expandedId === id);
        const reasonId = reasonResolver(id);
        if (!entry || !reasonId) return [];

        return entry.members.map((member) => ({
          orderItemId: member.orderItemId,
          quantity: member.quantity,
          cancellationReasonId: reasonId,
        }));
      }),
    [expandedItems],
  );

  const onSuccess = useCallback(
    (message?: string) => {
      setSelectedIds([]);
      setItemReasons({});
      setPendingItems([]);
      setWarningPreview(null);
      Alert.alert('Başarılı', message || 'Sipariş iptal talebiniz alındı.', [
        { text: 'Tamam', onPress: () => router.replace('/orders') },
      ]);
    },
    [router],
  );

  const handleError = useCallback((error: unknown, items: CancelItem[]) => {
    const preview = getCancellationBlockedPreview(error) ?? getAcknowledgementRequiredPreview(error);
    if (preview) {
      setWarningPreview(preview);
      setPendingItems(items);
      return;
    }
    setWarningPreview(null);
    Alert.alert('Hata', getCancelErrorMessage(error));
  }, []);

  const cancel = useCallback(async () => {
    if (!order || !isCancelable) {
      Alert.alert('Hata', 'Bu sipariş durumu için iptal talebi oluşturulamaz.');
      return;
    }
    const items = buildItems(selectedIds, (id) => itemReasons[id]);
    if (items.length === 0) {
      Alert.alert('Eksik Seçim', 'Lütfen iptal etmek istediğiniz ürünleri ve iptal nedenini seçin.');
      return;
    }
    try {
      const preview = await previewMutation.mutateAsync({ id: orderId, items });
      if (preview.cancellationBlocked || preview.campaignWillBreak) {
        setWarningPreview(preview);
        setPendingItems(items);
        return;
      }
      const result = await submitMutation.mutateAsync({ id: orderId, items });
      onSuccess(result.message);
    } catch (error) {
      handleError(error, items);
    }
  }, [
    order,
    isCancelable,
    buildItems,
    selectedIds,
    itemReasons,
    previewMutation,
    submitMutation,
    orderId,
    onSuccess,
    handleError,
  ]);

  const confirmWarning = useCallback(async () => {
    if (pendingItems.length === 0) return;
    try {
      const result = await submitMutation.mutateAsync({
        id: orderId,
        items: pendingItems,
        acknowledged: true,
      });
      onSuccess(result.message);
    } catch (error) {
      handleError(error, pendingItems);
    }
  }, [pendingItems, submitMutation, orderId, onSuccess, handleError]);

  const cancelAll = useCallback(async () => {
    const fallbackReasonId = defaultReasonId ?? reasons[0]?.id;
    if (!fallbackReasonId) {
      setWarningPreview(null);
      Alert.alert('Hata', 'İptal nedenleri henüz yüklenmedi. Lütfen tekrar deneyin.');
      return;
    }
    const allIds = expandedItems.map((entry) => entry.expandedId);
    const items = buildItems(allIds, (id) => itemReasons[id] ?? fallbackReasonId);
    if (items.length === 0) {
      setWarningPreview(null);
      Alert.alert('Hata', 'İptal edilecek aktif ürün bulunamadı.');
      return;
    }
    try {
      const result = await submitMutation.mutateAsync({ id: orderId, items });
      onSuccess(
        result.message ||
          'Siparişiniz tamamen iptal edildi, iade tutarı bankanıza bağlı olarak birkaç gün içinde kartınıza yansır.',
      );
    } catch (error) {
      handleError(error, items);
    }
  }, [
    defaultReasonId,
    reasons,
    expandedItems,
    buildItems,
    itemReasons,
    submitMutation,
    orderId,
    onSuccess,
    handleError,
  ]);

  const closeWarning = useCallback(() => {
    if (submitMutation.isPending) return;
    setWarningPreview(null);
    setPendingItems([]);
  }, [submitMutation.isPending]);

  const selectedCount = selectedIds.length;
  const allSelectedHaveReasons =
    isCancelable && selectedCount > 0 && selectedIds.every((id) => itemReasons[id] != null);

  return {
    order,
    reasons,
    expandedItems,
    isCancelable,
    selectedIds,
    itemReasons,
    selectedCount,
    allSelectedHaveReasons,
    isLoading: detailQuery.isPending,
    isError: detailQuery.isError,
    refetch: detailQuery.refetch,
    isSubmitting: previewMutation.isPending || submitMutation.isPending,
    isConfirming: submitMutation.isPending,
    warningPreview,
    showWarning: warningPreview !== null,
    toggleSelect,
    setReason,
    cancel,
    confirmWarning,
    cancelAll,
    closeWarning,
  };
}
