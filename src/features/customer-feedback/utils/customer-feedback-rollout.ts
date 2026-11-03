/**
 * customer_feedback_v2 kademeli açılış (sözleşme v1.0 §13: %5 → %25 → %100). Her kurulum 0–99 arası
 * SABİT bir kovaya düşer; kova yüzdenin altındaysa yeni form açılır. Yüzde 0 → herkes eski formda.
 */
export const ROLLOUT_BUCKET_KEY = 'customer-feedback.v2-bucket';

export function parseBucket(raw: string | null | undefined): number | null {
  if (!raw || !/^\d{1,2}$/.test(raw)) return null;
  return Number(raw);
}

export const createBucket = (random: () => number = Math.random): number => Math.floor(random() * 100) % 100;

export function isInRollout(bucket: number | null, percent: number): boolean {
  if (percent <= 0) return false;
  if (percent >= 100) return true;
  return bucket !== null && bucket < percent;
}
