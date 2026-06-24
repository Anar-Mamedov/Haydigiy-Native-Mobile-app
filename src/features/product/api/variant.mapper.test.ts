import { mapVariant, mapVariants } from './variant.mapper';

describe('mapVariant', () => {
  it('reads quantity/price/pivot id from the pivot and derives stock', () => {
    const result = mapVariant({
      id: 5,
      name: '38',
      name_2: 'M',
      pivot: { id: 99, quantity: '3', price: '349.99' },
    });
    expect(result).toEqual({
      id: '5',
      name: '38',
      name2: 'M',
      quantity: 3,
      price: 349.99,
      hasStock: true,
      pivotId: '99',
    });
  });

  it('marks out-of-stock and falls back to the variant id when no pivot', () => {
    const result = mapVariant({ id: 7, name: '40', quantity: 0 });
    expect(result.hasStock).toBe(false);
    expect(result.quantity).toBe(0);
    expect(result.pivotId).toBe('7');
  });
});

describe('mapVariants', () => {
  it('returns an empty array for undefined input', () => {
    expect(mapVariants(undefined)).toEqual([]);
  });
});
