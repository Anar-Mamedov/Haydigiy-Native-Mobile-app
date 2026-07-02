import { parseOrderCategory } from './order-category';

describe('parseOrderCategory', () => {
  it('accepts every known category', () => {
    expect(parseOrderCategory('all')).toBe('all');
    expect(parseOrderCategory('active')).toBe('active');
    expect(parseOrderCategory('returned')).toBe('returned');
    expect(parseOrderCategory('cancelled')).toBe('cancelled');
  });

  it('takes the first value of an array param', () => {
    expect(parseOrderCategory(['returned', 'all'])).toBe('returned');
  });

  it('returns null for unknown or missing values', () => {
    expect(parseOrderCategory('iade')).toBeNull();
    expect(parseOrderCategory('')).toBeNull();
    expect(parseOrderCategory(undefined)).toBeNull();
  });
});
