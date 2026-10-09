import { CargoCompany, PaymentMethod } from '@/types/checkout.types';

/** Cargo id 5 is the in-store pickup ("Mağazadan Al") option that only allows card payment (web parity). */
export const CARD_ONLY_CARGO_ID = 5;

const CARD_PAYMENT_SLUG = 'credit_card';

/** Payment methods offered for the selected cargo: in-store pickup narrows the list to card only. */
export function filterPaymentMethodsForCargo(
  methods: PaymentMethod[],
  cargo: CargoCompany | null,
): PaymentMethod[] {
  if (cargo?.id !== CARD_ONLY_CARGO_ID) return methods;
  return methods.filter((method) => method.slug === CARD_PAYMENT_SLUG);
}

/**
 * Cargo options offered for the selected payment method: in-store pickup is hidden while a
 * non-card method (e.g. Kapıda Ödeme) is selected. It stays listed while it is the selected
 * cargo itself, because the payment list then narrows to card and the method follows; hiding
 * it there would make the cargo and the method keep overriding each other.
 */
export function filterCargoForPaymentMethod(
  companies: CargoCompany[],
  method: PaymentMethod | null,
  selectedCargo: CargoCompany | null,
): CargoCompany[] {
  if (!method || method.slug === CARD_PAYMENT_SLUG) return companies;
  if (selectedCargo?.id === CARD_ONLY_CARGO_ID) return companies;
  return companies.filter((company) => company.id !== CARD_ONLY_CARGO_ID);
}
