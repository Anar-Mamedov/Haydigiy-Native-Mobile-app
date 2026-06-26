import { hasRestrictedCardPrefix, isValidCard } from './card.schema';

const validCard = {
  owner: 'AHMET YILMAZ',
  number: '4242 4242 4242 4242',
  expiryMonth: '08',
  expiryYear: '29',
  cvv: '123',
};

describe('hasRestrictedCardPrefix', () => {
  it('flags restricted BIN prefixes', () => {
    expect(hasRestrictedCardPrefix('5269 49')).toBe(true);
    expect(hasRestrictedCardPrefix('535112')).toBe(true);
  });

  it('allows other prefixes', () => {
    expect(hasRestrictedCardPrefix('4242')).toBe(false);
    expect(hasRestrictedCardPrefix('52')).toBe(false);
  });
});

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

  it('rejects a restricted BIN even when otherwise complete', () => {
    expect(isValidCard({ ...validCard, number: '5269 4242 4242 4242' })).toBe(false);
  });
});
