const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  i̇: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
};

/**
 * Lowercases (Turkish-aware) and folds Turkish accents to ASCII so searches are
 * accent- and case-insensitive (e.g. "nilufer" matches "Nilüfer").
 */
export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıi̇öşü]/g, (char) => TURKISH_MAP[char] ?? char)
    .trim();
}

/** True when `haystack` contains `query` after Turkish-aware normalization. */
export function matchesSearch(haystack: string, query: string): boolean {
  return normalizeSearchText(haystack).includes(normalizeSearchText(query));
}
