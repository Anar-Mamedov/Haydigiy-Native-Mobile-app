import { useQuery } from '@tanstack/react-query';
import { returnKeys } from './return.keys';
import { savedAddressesQueryOptions } from '@/features/address/api/address.query-options';
import { mapPaymentMethod, mapRefundMethods, mapReturnReason, mapSavedAddress } from './return.mapper';
import { getRefundMethodsDto, getReturnReasonsDto } from '@/services/return.service';
import { getPaymentMethodsDto } from '@/services/payment.service';
import {
  getCitiesDto,
  getDistrictsDto,
  getNeighbourhoodsDto,
} from '@/services/address.service';
import {
  LocationOption,
  PaymentMethod,
  RefundMethod,
  ReturnReason,
  SavedAddress,
} from '@/types/order.types';

/** Loads return reasons (`GET /return-requests/reasons`). */
export function useReturnReasonsQuery(enabled = true) {
  return useQuery<ReturnReason[]>({
    queryKey: returnKeys.reasons(),
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const dtos = await getReturnReasonsDto();
      return dtos.map(mapReturnReason);
    },
  });
}

/**
 * Loads the refund methods (`GET /return-requests/refund-methods`); only for
 * pay-on-delivery orders, where the customer may pick IBAN or a gift voucher.
 */
export function useRefundMethodsQuery(enabled = true) {
  return useQuery<RefundMethod[]>({
    queryKey: returnKeys.refundMethods(),
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => mapRefundMethods(await getRefundMethodsDto()),
  });
}

/** Loads saved refund IBANs (`GET /payment-methods`); only when the order needs one. */
export function usePaymentMethodsQuery(enabled = true) {
  return useQuery<PaymentMethod[]>({
    queryKey: returnKeys.paymentMethods(),
    enabled,
    queryFn: async () => {
      const dtos = await getPaymentMethodsDto();
      return dtos.map(mapPaymentMethod);
    },
  });
}

/** Loads the user's saved addresses (`GET /addresses`) for the pickup picker. */
export function useSavedAddressesQuery(enabled = true) {
  return useQuery({
    ...savedAddressesQueryOptions(),
    enabled,
    select: (dtos): SavedAddress[] => dtos.map(mapSavedAddress),
  });
}

/** Loads provinces (`GET /address/cities`) for the manual pickup address. */
export function useCitiesQuery(enabled = true) {
  return useQuery<LocationOption[]>({
    queryKey: returnKeys.cities(),
    enabled,
    staleTime: 60 * 60_000,
    queryFn: () => getCitiesDto(),
  });
}

/** Loads districts for the selected province. */
export function useDistrictsQuery(cityId: string) {
  return useQuery<LocationOption[]>({
    queryKey: returnKeys.districts(cityId),
    enabled: Boolean(cityId),
    staleTime: 60 * 60_000,
    queryFn: () => getDistrictsDto(cityId),
  });
}

/** Loads neighbourhoods for the selected district. */
export function useNeighbourhoodsQuery(districtId: string) {
  return useQuery<LocationOption[]>({
    queryKey: returnKeys.neighbourhoods(districtId),
    enabled: Boolean(districtId),
    staleTime: 60 * 60_000,
    queryFn: () => getNeighbourhoodsDto(districtId),
  });
}
