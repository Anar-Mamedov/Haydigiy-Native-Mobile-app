import { isValidCard } from './card.schema';

const validCard = {
  owner: 'AHMET YILMAZ',
  number: '4242 4242 4242 4242',
  expiryMonth: '08',
  expiryYear: '29',
  cvv: '123',
};

describe('isValidCard', () => {
  it('accepts a complete card (with grouping spaces)', () => {
    expect(isValidCard(validCard)).toBe(true);
  });

  it('rejects a short card number', () => {
    expect(isValidCard({ ...validCard, number: '4242 4242' })).toBe(false);
  });

  it('rejects an invalid month', () => {
    expect(isValidCard({ ...validCard, expiryMonth: '13' })).toBe(false);
    expect(isValidCard({ ...validCard, expiryMonth: '' })).toBe(false);
  });

  it('rejects a 2-digit CVV and empty owner', () => {
    expect(isValidCard({ ...validCard, cvv: '12' })).toBe(false);
    expect(isValidCard({ ...validCard, owner: '  ' })).toBe(false);
  });

  // Regression: Enpara cards were blocked on the client; the backend now routes them to İyzico.
  it('accepts Enpara BINs (5269, 5351)', () => {
    expect(isValidCard({ ...validCard, number: '5269 4242 4242 4242' })).toBe(true);
    expect(isValidCard({ ...validCard, number: '5351 1242 4242 4242' })).toBe(true);
  });
});
