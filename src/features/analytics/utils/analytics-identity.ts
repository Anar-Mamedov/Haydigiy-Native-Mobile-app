import { AnalyticsIdentity } from '../types/analytics.types';
import { User } from '@/types/auth.types';

/**
 * Backend `user.id`'yi JSON number olarak döndürüyor; `User.id: string`
 * sözleşmesi runtime'da tutmuyor (aynı tuzak `insider-tracker.ts` içinde de
 * belgeli). ClickHouse `user_id` kolonu tam sayı beklediği için dönüşüm tek
 * yerde yapılır.
 */
export function toAnalyticsUserId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Oturum sahibini analytics kimliğine çevirir. Kimlik çözülemezse `null` döner
 * ve çağıran taraf `identify` çağrısını hiç yapmaz — uydurma kimlik, kimliksiz
 * event'ten daha kötüdür.
 */
export function userToAnalyticsIdentity(user: User): AnalyticsIdentity | null {
  const userId = toAnalyticsUserId(user.id);
  if (userId === null) return null;

  return {
    userId,
    email: user.email?.includes('@') ? user.email.trim() : undefined,
    phone: user.phoneNumber?.trim() || undefined,
  };
}
