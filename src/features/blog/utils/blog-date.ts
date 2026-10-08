const TR_LONG_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

// Türkiye sabit UTC+3'te; yayın tarihi cihazın saat diliminden bağımsız gösterilir.
const TURKEY_UTC_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Yayın tarihini web'deki `Intl.DateTimeFormat('tr-TR', { day, month: 'long', year })`
 * çıktısıyla aynı biçimde verir ("1 Ekim 2026"). Hermes'te Intl ay adları her
 * platformda güvenilir olmadığı için ay adları elle eşlenir. Geçersiz değerde boş döner.
 */
export function formatBlogDate(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  // "2026-07-21 13:53:56" gibi bölgesiz backend saatini Hermes çözemiyor; Türkiye saati say.
  const isoValue = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(trimmed)
    ? `${trimmed.replace(' ', 'T')}+03:00`
    : trimmed;
  const time = Date.parse(isoValue);
  if (Number.isNaN(time)) return '';

  const turkey = new Date(time + TURKEY_UTC_OFFSET_MS);
  return `${turkey.getUTCDate()} ${TR_LONG_MONTHS[turkey.getUTCMonth()]} ${turkey.getUTCFullYear()}`;
}
