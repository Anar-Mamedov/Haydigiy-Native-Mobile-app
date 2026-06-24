import { buildSocialTickerMessages, formatSocialCount } from './social-ticker';

describe('formatSocialCount', () => {
  it('formats thousands with a Turkish decimal and B suffix', () => {
    expect(formatSocialCount(2600)).toBe('2,6B');
    expect(formatSocialCount(1500)).toBe('1,5B');
    expect(formatSocialCount(999)).toBe('999');
  });
});

describe('buildSocialTickerMessages', () => {
  it('includes cart and favourite messages when counts are positive', () => {
    const messages = buildSocialTickerMessages({ cartCount: 2600, favoritesCount: 432, totalQuantity: 0 });
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ icon: 'cart', highlight: '2,6B' });
    expect(messages[0].text).toContain('2,6B kişinin sepetinde');
    expect(messages[1]).toMatchObject({ icon: 'heart', highlight: '432' });
  });

  it('adds a low-stock alert only when 1-5 left', () => {
    expect(buildSocialTickerMessages({ cartCount: 0, favoritesCount: 0, totalQuantity: 3 })).toEqual([
      { text: 'Son 3 adet kaldı, tükenmeden al!', highlight: '3', icon: 'alert' },
    ]);
    expect(buildSocialTickerMessages({ cartCount: 0, favoritesCount: 0, totalQuantity: 9 })).toEqual([]);
  });

  it('returns an empty list when there is nothing to show', () => {
    expect(buildSocialTickerMessages({ cartCount: 0, favoritesCount: 0, totalQuantity: 0 })).toEqual([]);
  });
});
