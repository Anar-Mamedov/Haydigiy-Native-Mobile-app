/**
 * Masks a reviewer/asker name for privacy, mirroring the web `maskName`:
 * each word keeps its first (and, when long enough, last) letter, the rest
 * become asterisks. E.g. "Yusuf Önal" -> "Y***f Ö***l".
 */
export function maskName(name: string): string {
  const trimmed = name?.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word[0] + '*'.repeat(Math.max(0, word.length - 1));
      return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
    })
    .join(' ');
}
