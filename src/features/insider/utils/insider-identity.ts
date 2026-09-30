import { User } from '@/types/auth.types';
import { extractTurkishNationalNumber, isValidTurkishMobile } from '@/utils/turkish-phone';

/**
 * Insider identifier'ları String bekler ve farklı tipte gelen değeri sessizce
 * düşürür (`react-native-insider/src/InsiderIdentifier.js` → `checkParameters`
 * yalnızca `console.warn` atar). Backend `user.id`'yi JSON number olarak
 * döndürdüğü için `User.id: string` sözleşmesi runtime'da tutmaz ve CRM kimliği
 * hiç gönderilmez; bu yüzden değer sınırda normalize edilir.
 *
 * @see https://academy.insiderone.com/docs/react-native-user-object
 */
export function toInsiderIdentifierValue(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

/** Kayıtlı telefonlar ulusal formatta (5XXXXXXXXX); Insider E164 bekler. */
export function toE164TurkishPhone(phone: string | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;

  const national = extractTurkishNationalNumber(trimmed);
  if (!isValidTurkishMobile(national)) return null;
  return `+90${national}`;
}

export type InsiderUserIdentity = {
  userId: string | null;
  email: string | null;
  phone: string | null;
};

/**
 * Kullanıcının Insider'a gidecek identifier değerleri. Gönderim ve değişiklik
 * tespiti aynı kuralı kullanır; ayrışırlarsa tespit, gönderilen değerin
 * değiştiğini kaçırabilir.
 */
export function toInsiderUserIdentity(user: User): InsiderUserIdentity {
  return {
    userId: toInsiderIdentifierValue(user.id),
    email: user.email?.includes('@') ? user.email.trim() : null,
    phone: toE164TurkishPhone(user.phoneNumber),
  };
}

/**
 * Kaydedilen profil Insider identifier'larından birini değiştirdi mi?
 *
 * Karşılaştırma Insider'ın gördüğü biçim üzerinden yapılır: e-postada büyük/küçük harf
 * farkı (backend o durumda PATCH atmıyor), telefonda yazım farkı (0 önekli, boşluklu)
 * değişiklik sayılmaz. Önceki kullanıcı yoksa bunun bir DEĞİŞİKLİK olduğu bilinemez;
 * ilk kez tanımlama sayılır.
 */
export function hasInsiderIdentifierChanged(previous: User | null, next: User): boolean {
  if (!previous) return false;

  const before = toInsiderUserIdentity(previous);
  const after = toInsiderUserIdentity(next);

  return (
    before.email?.toLowerCase() !== after.email?.toLowerCase() || before.phone !== after.phone
  );
}
