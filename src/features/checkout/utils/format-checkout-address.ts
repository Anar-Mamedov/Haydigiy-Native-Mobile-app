import { CheckoutAddress } from '@/types/checkout.types';

function joinPresent(values: string[], separator: string): string {
  return values.map((value) => value.trim()).filter(Boolean).join(separator);
}

/** Formats the checkout address in the same order as the web payment screen. */
export function formatCheckoutAddressLine(address: CheckoutAddress): string {
  return joinPresent(
    [address.neighbourhoodName, address.addressLine, address.districtName, address.cityName],
    ', ',
  );
}

/** Name + phone line used by the checkout address selector. */
export function formatCheckoutRecipient(address: CheckoutAddress): string {
  return joinPresent([joinPresent([address.name, address.surname], ' '), address.phone], ' • ');
}
