/**
 * Kayıtlı doğum tarihini (`YYYY-MM-DD`) `InsiderUser.setBirthday` için UTC gece
 * yarısına çevirir; web'in gönderdiği `1980-01-01T00:00:00Z` ile aynı an.
 *
 * Yalnızca takvim günü okunur, yerel saat kullanılmaz: Türkiye'deki (UTC+3) bir
 * cihazda yerel gece yarısı UTC'de bir önceki güne düşer. Geçersiz ya da boş
 * tarih için `null` döner ve hiçbir şey gönderilmez.
 */
export function toInsiderBirthday(birthDate: string | null | undefined): Date | null {
  const match = birthDate?.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;

  return date;
}
