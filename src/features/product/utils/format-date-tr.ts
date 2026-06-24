/**
 * Formats an ISO/space date string as a Turkish long date (e.g. "20 Mayıs 2026").
 * Returns the raw input when it cannot be parsed.
 */
export function formatDateTR(dateStr: string): string {
  if (!dateStr) return '';
  const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}
