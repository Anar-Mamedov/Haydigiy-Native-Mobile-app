import type { UserProfile } from '../api/profile.mapper';

/**
 * Profilin tamamlanma adımları; web ile aynı sıra ve etiketler
 * (frontend `src/lib/utils/profileCompletion.ts`). Altı alan + doğrulanmış e-posta,
 * her adım eşit ağırlıkta. Boy, kilo ve beden profil yanıtında olsa da
 * düzenlenemediği için sayılmaz; sayılsa oran hiç %100 olamazdı.
 */
const PROFILE_COMPLETION_FIELDS = [
  { key: 'name', label: 'Ad' },
  { key: 'surname', label: 'Soyad' },
  { key: 'email', label: 'E-posta' },
  { key: 'phone', label: 'Telefon' },
  { key: 'birthDate', label: 'Doğum tarihi' },
  { key: 'gender', label: 'Cinsiyet' },
] as const satisfies readonly { key: keyof UserProfile; label: string }[];

export const EMAIL_VERIFICATION_LABEL = 'E-posta doğrulaması';

const STEP_COUNT = PROFILE_COMPLETION_FIELDS.length + 1;

type ProfileCompletionFieldKey = (typeof PROFILE_COMPLETION_FIELDS)[number]['key'];

export type ProfileCompletionSource = Partial<Pick<UserProfile, ProfileCompletionFieldKey | 'emailVerified'>>;

export type ProfileCompletion = {
  /** 0–100 arası tam sayı. */
  percent: number;
  /** Eksik adımların etiketleri, form sırasıyla. */
  missingLabels: string[];
  isComplete: boolean;
};

function isFilled(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

/** Profilin tamamlanan payı. Profil yoksa her adım eksik sayılır. */
export function getProfileCompletion(profile: ProfileCompletionSource | null | undefined): ProfileCompletion {
  const missingLabels: string[] = PROFILE_COMPLETION_FIELDS.filter(({ key }) => !isFilled(profile?.[key])).map(
    ({ label }) => label,
  );
  if (profile?.emailVerified !== true) missingLabels.push(EMAIL_VERIFICATION_LABEL);

  return {
    percent: Math.round(((STEP_COUNT - missingLabels.length) / STEP_COUNT) * 100),
    missingLabels,
    isComplete: missingLabels.length === 0,
  };
}
