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

/**
 * Cloudflare Image Resizing açık olan zone. `EXPO_PUBLIC_CDN_URL` başka bir hosta çevrilse bile
 * `/cdn-cgi/image/` yalnızca bu kökte üretilir; dönüşümü desteklemeyen bir hostta görsel kırılmaz.
 */
const IMAGE_RESIZING_ORIGIN = 'https://cdn.haydigiy.com';

/**
 * İstenen genişlikler bu kovalara yuvarlanır. Cloudflare her (görsel, seçenek) çiftini ayrı bir
 * "benzersiz dönüşüm" sayar; az sayıda sabit kova hem önbellek isabetini hem maliyeti dengeler.
 */
export const RESIZED_IMAGE_WIDTHS = [160, 240, 320, 480, 640, 828, 1080, 1280] as const;

const RESIZED_IMAGE_QUALITY = 80;

/** Dönüştürülmeyecek biçimler: SVG vektördür, GIF animasyonu yeniden kodlamak pahalıdır. */
const NON_RESIZABLE_EXTENSION = /\.(svg|gif)(\?|#|$)/i;

/** Ekranda `pixelWidth` fiziksel piksel kaplayacak görsel için en küçük yeterli kova. */
export function pickResizedImageWidth(pixelWidth: number): number {
  const target = Math.max(1, Math.ceil(pixelWidth));
  return RESIZED_IMAGE_WIDTHS.find((width) => width >= target) ?? RESIZED_IMAGE_WIDTHS[RESIZED_IMAGE_WIDTHS.length - 1];
}

/**
 * CDN'deki pazarlama görselini (banner, slider, hikâye) görüntüleneceği genişlikte ister. Cloudflare,
 * istemci `Accept` başlığında WebP bildirirse WebP, bildirmezse JPEG döner; ikisi de kaynak 1080 px
 * WebP'den (400–800 KB) çok küçüktür. `fit=scale-down` kaynaktan büyük görsel üretmez. CDN dışındaki,
 * zaten dönüştürülmüş ya da dönüştürülemeyen adresler olduğu gibi döner.
 *
 * Örnek: `https://cdn.haydigiy.com/cdn-cgi/image/width=480,quality=80,format=webp,fit=scale-down/banners/x.webp`
 */
export function buildResizedCdnImageUrl(url: string | null | undefined, pixelWidth: number): string | null {
  if (!url || url.trim() === '') return null;
  const trimmed = url.trim();
  const originPrefix = `${IMAGE_RESIZING_ORIGIN}/`;

  if (
    !trimmed.startsWith(originPrefix) ||
    trimmed.includes('/cdn-cgi/') ||
    NON_RESIZABLE_EXTENSION.test(trimmed) ||
    !Number.isFinite(pixelWidth) ||
    pixelWidth <= 0
  ) {
    return trimmed;
  }

  const options = [
    `width=${pickResizedImageWidth(pixelWidth)}`,
    `quality=${RESIZED_IMAGE_QUALITY}`,
    'format=webp',
    'fit=scale-down',
  ].join(',');

  return `${IMAGE_RESIZING_ORIGIN}/cdn-cgi/image/${options}/${trimmed.slice(originPrefix.length)}`;
}

/**
 * Ürün yüklemelerinin CDN'de önceden üretilmiş boyutları (genişlik px, 2:3 oran):
 * `thumb` 200×300, `medium` 600×900, `large` 1200×1800. Bu varyantlar ek dönüşüm maliyeti doğurmaz.
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
  if (!trimmed.startsWith(`${IMAGE_RESIZING_ORIGIN}/`) || !Number.isFinite(pixelWidth) || pixelWidth <= 0) {
    return trimmed;
  }

  const variant =
    PRODUCT_IMAGE_VARIANTS.find((candidate) => candidate.width >= pixelWidth) ??
    PRODUCT_IMAGE_VARIANTS[PRODUCT_IMAGE_VARIANTS.length - 1];

  return trimmed.replace(PRODUCT_VARIANT_SEGMENT, `$1${variant.name}$3`);
}
