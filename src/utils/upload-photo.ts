/** Backend'e giden fotoğrafların uzun kenarı en fazla bu kadar olur (backend sınırı: 5 MB). */
export const UPLOAD_PHOTO_MAX_EDGE = 2048;

export const UPLOAD_PHOTO_JPEG_QUALITY = 0.85;

/** Yalnızca uzun kenar verilir; diğeri oran korunarak hesaplanır. */
export type UploadPhotoResize = { width: number; height: null } | { width: null; height: number };

/** Uzun kenar sınırı aşıyorsa küçültme hedefini, aşmıyorsa `null` döner (küçük görsel büyütülmez). */
export function getUploadPhotoResize(width: number, height: number): UploadPhotoResize | null {
  if (!(Math.max(width, height) > UPLOAD_PHOTO_MAX_EDGE)) return null;
  return width >= height
    ? { width: UPLOAD_PHOTO_MAX_EDGE, height: null }
    : { width: null, height: UPLOAD_PHOTO_MAX_EDGE };
}

/** `IMG_1234.HEIC` → `IMG_1234.jpg`. Adı olmayan dosyaya varsayılan bir ad verir. */
export function toJpegFileName(name: string | null | undefined): string {
  const baseName = (name ?? '').trim().replace(/\.[^./\\]+$/, '');
  return `${baseName || 'photo'}.jpg`;
}
