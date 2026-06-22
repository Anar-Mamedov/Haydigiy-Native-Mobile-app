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

export type BirthDateParts = {
  day: string;
  month: string;
  year: string;
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

export function getDayOptions(): AppSelectOption[] {
  return Array.from({ length: 31 }, (_, i) => {
    const value = String(i + 1).padStart(2, '0');
    return { label: String(i + 1), value };
  });
}

export function getMonthOptions(): AppSelectOption[] {
  return MONTH_NAMES.map((name, i) => ({
    label: name,
    value: String(i + 1).padStart(2, '0'),
  }));
}

/** Years from (this year − minAge) back `span` years, newest first. */
export function getYearOptions(minAge = 8, span = 92): AppSelectOption[] {
  const maxYear = new Date().getFullYear() - minAge;
  return Array.from({ length: span }, (_, i) => {
    const year = String(maxYear - i);
    return { label: year, value: year };
  });
}
