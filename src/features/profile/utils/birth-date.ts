import { AppSelectOption } from '@/components/ui';

const MONTH_NAMES = [
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

const DAYS_IN_LONGEST_MONTH = 31;

/** Web `getMaxBirthday` ile aynı alt yaş sınırı. */
export const MIN_BIRTH_AGE = 16;

export type BirthDateParts = {
  day: string;
  month: string;
  year: string;
};

/** Seçilebilecek en yeni doğum tarihi (ay 1–12). */
export type BirthDateLimit = {
  day: number;
  month: number;
  year: number;
};

const EMPTY_PARTS: BirthDateParts = { day: '', month: '', year: '' };

/** Splits a "YYYY-MM-DD" string into zero-padded day/month/year parts. */
export function splitBirthDate(birthDate: string | null | undefined): BirthDateParts {
  if (!birthDate) return EMPTY_PARTS;
  const [year, month, day] = birthDate.split('-');
  if (!year || !month || !day) return EMPTY_PARTS;
  return { day, month, year };
}

/** Combines parts into "YYYY-MM-DD"; returns null unless all three are present. */
export function combineBirthDate({ day, month, year }: BirthDateParts): string | null {
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Bugün `minAge` yaşını dolduran en geç doğum tarihi — web `getMaxBirthday`
 * portu. Yerel saatle hesaplanır; 29 Şubat gibi taşan günleri `Date` kaydırır.
 */
export function getMaxBirthDate(
  minAge: number = MIN_BIRTH_AGE,
  today: Date = new Date(),
): BirthDateLimit {
  const date = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
}

function isLimitYear(year: string, limit: BirthDateLimit) {
  return Number(year) === limit.year;
}

function isLimitMonth(parts: Pick<BirthDateParts, 'month' | 'year'>, limit: BirthDateLimit) {
  return isLimitYear(parts.year, limit) && Number(parts.month) === limit.month;
}

/** 1–31; sınır yılı ve ayı seçiliyken sınır gününden sonrası gizlenir (web paritesi). */
export function getDayOptions(
  selection: Pick<BirthDateParts, 'month' | 'year'> = EMPTY_PARTS,
  limit: BirthDateLimit = getMaxBirthDate(),
): AppSelectOption[] {
  const count = isLimitMonth(selection, limit) ? limit.day : DAYS_IN_LONGEST_MONTH;
  return Array.from({ length: count }, (_, i) => {
    const value = String(i + 1).padStart(2, '0');
    return { label: String(i + 1), value };
  });
}

/** Ocak–Aralık; sınır yılı seçiliyken sınır ayından sonrası gizlenir (web paritesi). */
export function getMonthOptions(
  selection: Pick<BirthDateParts, 'year'> = EMPTY_PARTS,
  limit: BirthDateLimit = getMaxBirthDate(),
): AppSelectOption[] {
  const months = isLimitYear(selection.year, limit) ? MONTH_NAMES.slice(0, limit.month) : MONTH_NAMES;
  return months.map((name, i) => ({
    label: name,
    value: String(i + 1).padStart(2, '0'),
  }));
}

/**
 * Years from the limit year back `span` years, newest first. `keepYear`, eski
 * kuralla (8 yaş) kaydedilmiş ve sınırdan yeni bir yılsa başa eklenir: web'de
 * kayıtlı tarih seçili görünmeye devam eder ve olduğu gibi geri gönderilir.
 */
export function getYearOptions(
  limit: BirthDateLimit = getMaxBirthDate(),
  span = 92,
  keepYear = '',
): AppSelectOption[] {
  const years = Array.from({ length: span }, (_, i) => {
    const year = String(limit.year - i);
    return { label: year, value: year };
  });
  return keepYear && Number(keepYear) > limit.year ? [{ label: keepYear, value: keepYear }, ...years] : years;
}

/**
 * Yıl ya da ay değişince artık listede olmayan ay/günü boşaltır; web formundaki
 * `onChange` temizliğinin aynısı. Kullanıcı yaşı 16'nın altına düşüren bir
 * tarihle kalamaz, alanı yeniden seçer.
 */
export function clampBirthDateParts(parts: BirthDateParts, limit: BirthDateLimit): BirthDateParts {
  const month =
    isLimitYear(parts.year, limit) && Number(parts.month) > limit.month ? '' : parts.month;
  const day =
    isLimitMonth({ month, year: parts.year }, limit) && Number(parts.day) > limit.day
      ? ''
      : parts.day;
  return { day, month, year: parts.year };
}
