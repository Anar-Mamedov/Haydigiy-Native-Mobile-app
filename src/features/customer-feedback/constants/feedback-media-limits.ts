/**
 * Dosya sınırları (sözleşme v1.0 §5.2, §7). Video sınırı (25 MB / 30 sn) forms cevabında GELMEZ;
 * değişirse yalnız burası güncellenir (karar 2026-11-02). Görsel sınırı alanın `max_size_kb`'sinden okunur.
 */
export const FEEDBACK_MEDIA_LIMITS = {
  maxVideoBytes: 25 * 1024 * 1024,
  maxVideoSeconds: 30,
  maxVideosPerSubmission: 1,
  defaultMaxFiles: 5,
  maxParallelUploads: 2,
  defaultAccept: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
} as const;
