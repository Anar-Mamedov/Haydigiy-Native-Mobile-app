import { parseQuery } from './parse-query';

describe('parseQuery', () => {
  it('parses a callback URL query into a record', () => {
    const result = parseQuery(
      'https://haydigiy.com/odeme-basarili?order_no=ORD1&mdstatus=1&total_price=169.98',
    );
    expect(result.order_no).toBe('ORD1');
    expect(result.mdstatus).toBe('1');
    expect(result.total_price).toBe('169.98');
  });

  it('decodes encoded values and plus-as-space', () => {
    const result = parseQuery('x?message=%C3%96deme+ba%C5%9Far%C4%B1s%C4%B1z');
    expect(result.message).toBe('Ödeme başarısız');
  });

  it('returns an empty object when there is no query', () => {
    expect(parseQuery('https://haydigiy.com/odeme-basarili')).toEqual({});
    expect(parseQuery(undefined)).toEqual({});
  });
});
