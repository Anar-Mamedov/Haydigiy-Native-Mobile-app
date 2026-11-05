/**
 * Resolves a media path returned by the backend into an absolute CDN URL,
 * mirroring the web `getCdnUrl`. Absolute URLs pass through unchanged; relative
 * paths are prefixed with the CDN host. Returns null for empty input so callers
 * can decide on a placeholder.
 */
const CDN_BASE_URL = (process.env.EXPO_PUBLIC_CDN_URL?.trim() || 'https://cdn.haydigiy.com').replace(
  /\/+$/,
  '',
);

export function resolveCdnUrl(path: string | null | undefined): string | null {
  if (!path || path.trim() === '') return null;
  const trimmed = path.trim();
  if (trimmed.startsWith('http')) return trimmed;
  return `${CDN_BASE_URL}/${trimmed.startsWith('/') ? trimmed.slice(1) : trimmed}`;
}

/** Ürün görsellerinin hazır varyantlarının bulunduğu CDN kökü. */
const PRODUCT_IMAGE_ORIGIN = 'https://cdn.haydigiy.com';

/**
 * Ürün yüklemelerinin CDN'de önceden üretilmiş boyutları (genişlik px, 2:3 oran):
 * `thumb` 200×300, `medium` 600×900, `large` 1200×1800. Cloudflare görsel dönüşümü kullanılmaz
 * (dönüşüm başına ücretli); banner'lar panelde yüklenirken sıkıştırılır ve olduğu gibi gösterilir.
 */
const PRODUCT_IMAGE_VARIANTS = [
  { name: 'thumb', width: 200 },
  { name: 'medium', width: 600 },
  { name: 'large', width: 1200 },
] as const;

/** `.../uploads/.../<varyant>/<dosya>` biçimindeki ürün görseli yolunun varyant bölümü. */
const PRODUCT_VARIANT_SEGMENT = /(\/uploads\/(?:[^/?#]+\/)*)(thumb|medium|large)(\/[^/?#]+(?:[?#].*)?)$/;

/**
 * Ürün görselini, ekranda `pixelWidth` fiziksel piksel kaplayacak en küçük hazır varyanta çevirir
 * (ör. 132 dp genişliğindeki kart için `large` yerine `medium`). Varyant yolu taşımayan adresler
 * olduğu gibi döner.
 */
export function selectProductImageVariant(url: string | null | undefined, pixelWidth: number): string | null {
  if (!url || url.trim() === '') return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith(`${PRODUCT_IMAGE_ORIGIN}/`) || !Number.isFinite(pixelWidth) || pixelWidth <= 0) {
    return trimmed;
  }

  const variant =
    PRODUCT_IMAGE_VARIANTS.find((candidate) => candidate.width >= pixelWidth) ??
    PRODUCT_IMAGE_VARIANTS[PRODUCT_IMAGE_VARIANTS.length - 1];

  return trimmed.replace(PRODUCT_VARIANT_SEGMENT, `$1${variant.name}$3`);
}
