import { formatTurkeyDateTime } from './format-turkey-date-time';

describe('formatTurkeyDateTime', () => {
  // Backend iade kuponunun bitişini UTC ISO (mikrosaniyeli) gönderiyor; ekranda ham hali görünüyordu.
  it('formats a UTC ISO timestamp as a Turkey-time label', () => {
    expect(formatTurkeyDateTime('2027-04-03T10:53:43.000000Z')).toBe('03 Nis 2027 - 13:53');
  });

  it('rolls the date over when Turkey time passes midnight', () => {
    expect(formatTurkeyDateTime('2026-12-31T21:30:00Z')).toBe('01 Oca 2027 - 00:30');
  });

  it('honours an explicit UTC offset', () => {
    expect(formatTurkeyDateTime('2027-08-15T09:05:00+03:00')).toBe('15 Ağu 2027 - 09:05');
    expect(formatTurkeyDateTime('2027-08-15T01:05:00-0500')).toBe('15 Ağu 2027 - 09:05');
  });

  it('treats a timestamp without a zone as backend (Turkey) time', () => {
    expect(formatTurkeyDateTime('2027-02-07 23:59:59')).toBe('07 Şub 2027 - 23:59');
  });

  it('formats a date-only value without a time', () => {
    expect(formatTurkeyDateTime('2027-02-07')).toBe('07 Şub 2027');
  });

  it('keeps a value that is not an ISO date as it is', () => {
    expect(formatTurkeyDateTime(' 03 Nis 2027 - 13:53 ')).toBe('03 Nis 2027 - 13:53');
    expect(formatTurkeyDateTime('2027-13-01')).toBe('2027-13-01');
  });

  it('returns null for an empty value', () => {
    expect(formatTurkeyDateTime(null)).toBeNull();
    expect(formatTurkeyDateTime(undefined)).toBeNull();
    expect(formatTurkeyDateTime('   ')).toBeNull();
  });
});
