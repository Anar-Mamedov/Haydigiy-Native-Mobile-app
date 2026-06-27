import { resolveCdnUrl } from '@/utils/cdn';

/**
 * Resolves top-banner image paths through the CDN host used by the web app.
 * The API host serves banner metadata, but the actual uploaded files live on
 * the CDN. Using the API host leaves Expo Image with a 404 and an empty strip.
 */
export function resolveTopBannerImageUrl(path: string | null | undefined): string {
  return resolveCdnUrl(path) ?? '';
}

/** Convenience wrapper kept at the feature boundary for the banner component. */
export function getTopBannerImageUrl(path: string | null | undefined): string {
  return resolveTopBannerImageUrl(path);
}
