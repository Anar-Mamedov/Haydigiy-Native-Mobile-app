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
