import {
  formatCheckoutAddressLine,
  formatCheckoutRecipient,
} from './format-checkout-address';
import { CheckoutAddress } from '@/types/checkout.types';

const baseAddress: CheckoutAddress = {
  id: 1,
  title: 'ev',
  name: 'Anar',
  surname: 'Mamedov',
  email: null,
  phone: '5076534641',
  addressLine: 'haydigiy ofisi',
  zipCode: '',
  cityId: 51,
  cityName: 'NİĞDE',
  districtId: 1,
  districtName: 'MERKEZ',
  neighbourhoodId: 10,
  neighbourhoodName: 'MERKEZ MAH. (ÇAVDARLI KÖYÜ)',
  isDefault: true,
  isInvoice: false,
};

describe('formatCheckoutAddressLine', () => {
  it('matches the web checkout address order', () => {
    expect(formatCheckoutAddressLine(baseAddress)).toBe(
      'MERKEZ MAH. (ÇAVDARLI KÖYÜ), haydigiy ofisi, MERKEZ, NİĞDE',
    );
  });

  it('omits missing location parts without leaving separators', () => {
    expect(
      formatCheckoutAddressLine({
        ...baseAddress,
        neighbourhoodName: '',
        districtName: '',
      }),
    ).toBe('haydigiy ofisi, NİĞDE');
  });
});

describe('formatCheckoutRecipient', () => {
  it('formats the name and phone line used by the selector', () => {
    expect(formatCheckoutRecipient(baseAddress)).toBe('Anar Mamedov • 5076534641');
  });
});
