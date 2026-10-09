import { CargoCompany, PaymentMethod } from '@/types/checkout.types';
import {
  CARD_ONLY_CARGO_ID,
  filterCargoForPaymentMethod,
  filterPaymentMethodsForCargo,
} from './cargo-payment-rules';

function makeCompany(overrides: Partial<CargoCompany> = {}): CargoCompany {
  return {
    id: 1,
    name: 'Hepsijet',
    logo: '',
    price: 119.99,
    sortOrder: 1,
    toCityDistrict: null,
    toVillageRural: null,
    ...overrides,
  };
}

function makeMethod(overrides: Partial<PaymentMethod> = {}): PaymentMethod {
  return {
    id: 1,
    name: 'Kredi / Banka Kartı',
    slug: 'credit_card',
    commissionRate: 0,
    serviceFee: 0,
    sortOrder: 1,
    description: null,
    maxOrderTotal: null,
    ...overrides,
  };
}

const hepsijet = makeCompany();
const storePickup = makeCompany({ id: CARD_ONLY_CARGO_ID, name: 'Mağazadan Al', price: 0 });
const companies = [hepsijet, storePickup];
const card = makeMethod();
const cashOnDelivery = makeMethod({ id: 2, name: 'Kapıda Nakit Ödeme', slug: 'kapida_odeme', serviceFee: 19.99 });
const methods = [card, cashOnDelivery];

describe('filterPaymentMethodsForCargo', () => {
  it('offers only card payment for in-store pickup', () => {
    expect(filterPaymentMethodsForCargo(methods, storePickup)).toEqual([card]);
  });

  it('keeps every method for other cargo options', () => {
    expect(filterPaymentMethodsForCargo(methods, hepsijet)).toEqual(methods);
    expect(filterPaymentMethodsForCargo(methods, null)).toEqual(methods);
  });
});

describe('filterCargoForPaymentMethod', () => {
  // HMA-2: Kapıda Ödeme seçiliyken "Mağazadan Al" listede kalıyordu.
  it('hides in-store pickup while cash on delivery is selected', () => {
    expect(filterCargoForPaymentMethod(companies, cashOnDelivery, hepsijet)).toEqual([hepsijet]);
  });

  it('keeps in-store pickup for card payment or before a method is chosen', () => {
    expect(filterCargoForPaymentMethod(companies, card, hepsijet)).toEqual(companies);
    expect(filterCargoForPaymentMethod(companies, null, null)).toEqual(companies);
  });

  it('keeps in-store pickup while it is the selected cargo so the selection does not flip', () => {
    expect(filterCargoForPaymentMethod(companies, cashOnDelivery, storePickup)).toEqual(companies);
  });
});
