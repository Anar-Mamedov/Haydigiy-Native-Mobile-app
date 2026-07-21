import { mapAppVersionNumber } from './app-version.mapper';

describe('mapAppVersionNumber', () => {
  it('maps the current API response', () => {
    expect(mapAppVersionNumber({ status: 'success', data: '1' })).toBe('1');
  });

  it('accepts numeric and dotted version values', () => {
    expect(mapAppVersionNumber({ data: 27 })).toBe('27');
    expect(mapAppVersionNumber({ data: 'v2.4.0' })).toBe('2.4.0');
  });

  it.each([
    { status: 'error', data: '27' },
    { status: 'success', data: null },
    { status: 'success', data: 'latest' },
  ])('rejects an unusable response: %p', (response) => {
    expect(() => mapAppVersionNumber(response)).toThrow();
  });
});
