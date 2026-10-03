// Carbon'un `translatedFormat('M')` çıktısıyla aynı kısaltmalar; etiketler backend'inkilerle birebir eşleşir.
const TR_SHORT_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// Türkiye 2016'dan beri yaz saati uygulamadan sabit UTC+3'te ve backend'in hazır etiketleri
// (ör. "İade Tarihi") bu saatle üretiliyor; cihazın saat dilimi kullanılmaz. Hermes'te
// `Intl.DateTimeFormat#formatToParts` desteklenmediği için çeviri elle yapılır.
const TURKEY_UTC_OFFSET_MINUTES = 3 * 60;

// "2027-02-07", "2027-04-03 13:53:43", "2027-04-03T10:53:43.000000Z", "2027-04-03T13:53:43+03:00"
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/i;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** UTC offset of an ISO zone suffix in minutes; a missing zone means backend (Turkey) time. */
function parseZoneOffsetMinutes(zone: string | undefined): number {
  if (!zone) return TURKEY_UTC_OFFSET_MINUTES;
  if (zone.toUpperCase() === 'Z') return 0;
  const digits = zone.slice(1).replace(':', '');
  const minutes = Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2));
  return zone.startsWith('-') ? -minutes : minutes;
}

/**
 * Formats an API date like the backend's own labels ("d M Y - H:i", Turkey time):
 * "2027-04-03T10:53:43.000000Z" → "03 Nis 2027 - 13:53", "2027-02-07" → "07 Şub 2027".
 * Returns null for an empty value and the trimmed input when it is not an ISO date
 * (e.g. a label the backend already formatted).
 */
export function formatTurkeyDateTime(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = ISO_DATE_PATTERN.exec(trimmed);
  if (!match) return trimmed;

  const [, year, month, day, hour, minute, zone] = match;
  const monthName = TR_SHORT_MONTHS[Number(month) - 1];
  if (!monthName) return trimmed;
  if (hour === undefined) return `${day} ${monthName} ${year}`;

  const utcMs =
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)) -
    parseZoneOffsetMinutes(zone) * 60_000;
  const turkey = new Date(utcMs + TURKEY_UTC_OFFSET_MINUTES * 60_000);

  const date = `${pad(turkey.getUTCDate())} ${TR_SHORT_MONTHS[turkey.getUTCMonth()]} ${turkey.getUTCFullYear()}`;
  return `${date} - ${pad(turkey.getUTCHours())}:${pad(turkey.getUTCMinutes())}`;
}
