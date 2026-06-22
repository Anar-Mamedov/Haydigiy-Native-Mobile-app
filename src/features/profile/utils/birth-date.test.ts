import { combineBirthDate, getYearOptions, splitBirthDate } from './birth-date';

describe('splitBirthDate', () => {
  it('splits a YYYY-MM-DD string into parts', () => {
    expect(splitBirthDate('1990-05-08')).toEqual({ day: '08', month: '05', year: '1990' });
  });

  it('returns empty parts for null or malformed input', () => {
    expect(splitBirthDate(null)).toEqual({ day: '', month: '', year: '' });
    expect(splitBirthDate('1990')).toEqual({ day: '', month: '', year: '' });
  });
});

describe('combineBirthDate', () => {
  it('combines and zero-pads parts into YYYY-MM-DD', () => {
    expect(combineBirthDate({ day: '8', month: '5', year: '1990' })).toBe('1990-05-08');
  });

  it('returns null when any part is missing', () => {
    expect(combineBirthDate({ day: '8', month: '', year: '1990' })).toBeNull();
    expect(combineBirthDate({ day: '', month: '', year: '' })).toBeNull();
  });
});

describe('getYearOptions', () => {
  it('caps the newest year at this year minus the minimum age (8)', () => {
    const expectedMaxYear = String(new Date().getFullYear() - 8);
    expect(getYearOptions()[0].value).toBe(expectedMaxYear);
  });
});
