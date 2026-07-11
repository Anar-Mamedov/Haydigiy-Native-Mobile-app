import { useQuery } from '@tanstack/react-query';
import { checkoutKeys } from './checkout.keys';
import { savedAddressesQueryOptions } from '@/features/address/api/address.query-options';
import {
  mapCargoCompany,
  mapCheckoutAddress,
  mapInstallmentPlans,
  mapPaymentMethod,
} from './checkout.mapper';
import { getPaymentTypesDto } from '@/services/payment-type.service';
import { getCargoCompaniesDto } from '@/services/cargo.service';
import { getInstallmentsDto } from '@/services/installment.service';
import {
  CargoCompany,
  CheckoutAddress,
  InstallmentPlan,
  PaymentMethod,
} from '@/types/checkout.types';

/** Payment options for the payment-method list (`GET /payment-types`). */
export function usePaymentTypesQuery() {
  return useQuery<PaymentMethod[]>({
    queryKey: checkoutKeys.paymentTypes(),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await getPaymentTypesDto()).map(mapPaymentMethod),
  });
}

/** Cargo options for the selected address region (`GET /cargo-companies(/available)`). */
export function useCargoCompaniesQuery(address: CheckoutAddress | null) {
  return useQuery<CargoCompany[]>({
    queryKey: checkoutKeys.cargo(
      address?.cityId,
      address?.districtId,
      address?.neighbourhoodId,
    ),
    queryFn: async () => {
      const dtos = await getCargoCompaniesDto(
        address
          ? {
              cityId: address.cityId,
              districtId: address.districtId,
              neighbourhoodId: address.neighbourhoodId,
            }
          : undefined,
      );
      return dtos.map(mapCargoCompany).sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });
}

/** Saved addresses enriched with location IDs + email for checkout. */
export function useCheckoutAddressesQuery(enabled = true) {
  return useQuery({
    ...savedAddressesQueryOptions(),
    enabled,
    select: (dtos): CheckoutAddress[] => dtos.map(mapCheckoutAddress),
  });
}

/**
 * İyzico installment plans for an 8-digit BIN + single-payment amount. The amount
 * is the Tek Çekim total so the rates stay stable while the user picks a plan.
 *
 * The key uses the kuruş-precision amount (web parity: the web refetches on any
 * exact single-payment total change). A coarser key would keep serving per-month
 * prices computed for a nearby-but-different total, and `installment × perMonth`
 * could then fall below the backend's calculated order total at charge time.
 */
export function useInstallmentPlansQuery(bin: string, amount: number, enabled = true) {
  const isReady = bin.length === 8 && amount >= 1;
  return useQuery<InstallmentPlan[]>({
    queryKey: checkoutKeys.installments(bin, Number(amount.toFixed(2))),
    enabled: enabled && isReady,
    staleTime: 60_000,
    queryFn: async () => mapInstallmentPlans(await getInstallmentsDto(bin, amount), amount),
  });
}
