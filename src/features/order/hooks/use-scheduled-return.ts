import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSavedAddressesQuery } from '../api/return.queries';
import {
  useCancelHepsijetDeliveryMutation,
  useHepsijetAvailableDatesMutation,
  useSendHepsijetDeliveryMutation,
} from '../api/hepsijet.mutations';
import {
  buildHepsijetSendPayload,
  getHepsijetReturnDeliveryNo,
} from '@/services/hepsijet.service';
import { getReturnErrorMessage } from '@/services/return.service';
import { OrderDetail, ResolvedAddress } from '@/types/order.types';

const PICKUP_WINDOW_DAYS = 30;
const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const toIsoDate = (date: Date) => date.toISOString().split('T')[0];

const normalizePhone = (value?: string) => {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('0') ? digits : `0${digits}`;
};

/** Formats `YYYY-MM-DD` to a short Turkish label (e.g. "5 Tem Cuma"). */
export function formatPickupDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${WEEKDAYS[date.getDay()]}`;
}

/**
 * Orchestrates the Hepsijet scheduled-return (home pickup) flow: choosing a saved
 * address, fetching bookable days for it, and creating / cancelling the courier
 * pickup. New addresses are added via the full-screen AddressAddModal, then the
 * saved list is refetched here.
 */
export function useScheduledReturn(order: OrderDetail | null, enabled: boolean) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const defaultEnd = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return toIsoDate(date);
  }, []);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [hasFetchedDates, setHasFetchedDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const addressesQuery = useSavedAddressesQuery(enabled);
  const datesMutation = useHepsijetAvailableDatesMutation();
  const sendMutation = useSendHepsijetDeliveryMutation();
  const cancelMutation = useCancelHepsijetDeliveryMutation();

  const savedAddresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);

  const dateOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    const base = new Date();
    for (let i = 0; i < PICKUP_WINDOW_DAYS; i += 1) {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      const iso = toIsoDate(date);
      options.push({ label: formatPickupDate(iso), value: iso });
    }
    return options;
  }, []);

  // Default the selected saved address to the first one once loaded.
  useEffect(() => {
    if (!selectedAddressId && savedAddresses.length > 0) {
      setSelectedAddressId(savedAddresses[0].id);
    }
  }, [savedAddresses, selectedAddressId]);

  // Any address change invalidates previously fetched availability.
  useEffect(() => {
    setAvailableDates([]);
    setSelectedDate(null);
    setHasFetchedDates(false);
    setDatesError(null);
  }, [selectedAddressId]);

  const resolvedAddress = useMemo<ResolvedAddress | null>(() => {
    const found = savedAddresses.find((address) => address.id === selectedAddressId);
    if (!found || !found.city || !found.district) return null;
    return {
      city: found.city,
      town: found.district,
      district: found.neighbourhood,
      addressLine1: found.addressLine,
      name: found.name,
      surname: found.surname,
      phone: normalizePhone(found.phone),
    };
  }, [savedAddresses, selectedAddressId]);

  const fetchDates = useCallback(async () => {
    if (!resolvedAddress) {
      setDatesError('Lütfen önce geçerli bir adres seçin.');
      return;
    }
    if (!startDate || !endDate || startDate > endDate) {
      setDatesError('Lütfen geçerli bir tarih aralığı seçin.');
      return;
    }
    setDatesError(null);
    setSelectedDate(null);
    try {
      const dates = await datesMutation.mutateAsync({
        startDate,
        endDate,
        city: resolvedAddress.city,
        town: resolvedAddress.town,
      });
      setAvailableDates(dates);
      setHasFetchedDates(true);
      if (dates.length === 0) {
        setDatesError('Seçilen adres ve tarih aralığı için uygun gün bulunamadı.');
      }
    } catch {
      setAvailableDates([]);
      setDatesError('Uygun günler alınamadı. Lütfen tekrar deneyin.');
    }
  }, [resolvedAddress, startDate, endDate, datesMutation]);

  const submitPickup = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!order || !resolvedAddress || !selectedDate) {
      return { success: false, message: 'Randevu bilgileri eksik.' };
    }
    try {
      const payload = buildHepsijetSendPayload({
        deliveryDate: selectedDate,
        customerOrderNo: order.orderNo,
        sender: {
          city: resolvedAddress.city,
          town: resolvedAddress.town,
          district: resolvedAddress.district,
          addressLine1: resolvedAddress.addressLine1,
        },
        receiver: {
          firstName: resolvedAddress.name,
          lastName: resolvedAddress.surname,
          phone1: resolvedAddress.phone,
        },
      });
      await sendMutation.mutateAsync(payload);
      return { success: true };
    } catch (error) {
      return { success: false, message: getReturnErrorMessage(error, 'Randevu oluşturulamadı.') };
    }
  }, [order, resolvedAddress, selectedDate, sendMutation]);

  const cancelPickup = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    if (!order?.orderNo) {
      return { success: false, message: 'Randevu iptali için sipariş numarası bulunamadı.' };
    }
    try {
      const deliveryNo = getHepsijetReturnDeliveryNo(order.orderNo);
      const result = await cancelMutation.mutateAsync(deliveryNo);
      return { success: result?.success !== false, message: result?.message };
    } catch (error) {
      return { success: false, message: getReturnErrorMessage(error, 'Randevu iptal edilemedi.') };
    }
  }, [order, cancelMutation]);

  return {
    savedAddresses,
    savedLoading: addressesQuery.isPending,
    selectedAddressId,
    setSelectedAddressId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    today,
    dateOptions,
    availableDates,
    datesLoading: datesMutation.isPending,
    datesError,
    hasFetchedDates,
    selectedDate,
    setSelectedDate,
    fetchDates,
    resolvedAddress,
    submitPickup,
    cancelPickup,
    pickupSubmitting: sendMutation.isPending,
    canSchedule: Boolean(resolvedAddress) && Boolean(selectedDate),
    refetchAddresses: addressesQuery.refetch,
  };
}

export type UseScheduledReturn = ReturnType<typeof useScheduledReturn>;
