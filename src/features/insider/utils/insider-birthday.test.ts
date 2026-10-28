import { toInsiderBirthday } from './insider-birthday';

/**
 * Insider `birthday` web'de `1980-01-01T00:00:00Z` olarak gidiyor; uygulama aynı
 * anı `Date` olarak verir ki iki kanal profile aynı günü yazsın.
 */
describe('toInsiderBirthday', () => {
  it('maps the saved date to UTC midnight of the same calendar day', () => {
    expect(toInsiderBirthday('1980-01-01')?.toISOString()).toBe('1980-01-01T00:00:00.000Z');
  });

  it('reads only the calendar day when the backend adds a time part', () => {
    expect(toInsiderBirthday('1995-12-31 00:00:00')?.toISOString()).toBe(
      '1995-12-31T00:00:00.000Z',
    );
    expect(toInsiderBirthday('1995-12-31T00:00:00.000000Z')?.toISOString()).toBe(
      '1995-12-31T00:00:00.000Z',
    );
  });

  it('returns null for an empty or invalid date', () => {
    expect(toInsiderBirthday(undefined)).toBeNull();
    expect(toInsiderBirthday(null)).toBeNull();
    expect(toInsiderBirthday('')).toBeNull();
    expect(toInsiderBirthday('2001-02-30')).toBeNull();
    expect(toInsiderBirthday('31.12.1995')).toBeNull();
  });
});
