import { formatDateTR } from './format-date-tr';

describe('formatDateTR', () => {
  it('formats an ISO date as a Turkish long date', () => {
    const result = formatDateTR('2026-05-20T00:00:00Z');
    expect(result).toContain('2026');
    expect(result).not.toBe('2026-05-20T00:00:00Z');
  });

  it('handles a space-separated date string', () => {
    const result = formatDateTR('2026-05-20 10:30:00');
    expect(result).toContain('2026');
  });

  it('returns an empty string for empty input', () => {
    expect(formatDateTR('')).toBe('');
  });

  it('returns the raw value when it cannot be parsed', () => {
    expect(formatDateTR('not-a-date')).toBe('not-a-date');
  });
});
