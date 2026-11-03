import { useEffect, useState } from 'react';
import { appEnv } from '@/lib/env';
import { appStorage } from '@/lib/storage/mmkv';
import { createBucket, isInRollout, parseBucket, ROLLOUT_BUCKET_KEY } from '../utils/customer-feedback-rollout';

async function readOrCreateBucket(): Promise<number> {
  const stored = parseBucket(await appStorage.getItem(ROLLOUT_BUCKET_KEY));
  if (stored !== null) return stored;
  const created = createBucket();
  await appStorage.setItem(ROLLOUT_BUCKET_KEY, String(created));
  return created;
}

/**
 * Yeni geri bildirim formu bu kurulumda açık mı? Kapalıyken eski ürün sheet'i ve eski Hesabım ekranı
 * aynen çalışır (geri alma = yüzdeyi 0 yapmak). Kova MMKV'de kalıcıdır; kişisel veri değildir.
 */
export function useCustomerFeedbackV2Enabled(percent: number = appEnv.customerFeedbackV2Percent): boolean {
  const [bucket, setBucket] = useState<number | null>(null);
  const needsBucket = percent > 0 && percent < 100;

  useEffect(() => {
    if (!needsBucket) return;
    let active = true;
    readOrCreateBucket()
      .then((value) => {
        if (active) setBucket(value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [needsBucket]);

  return isInRollout(bucket, percent);
}
