import type { VideoSource } from 'expo-video';

/**
 * Maps a raw video URL to an expo-video {@link VideoSource}, detecting HLS (.m3u8)
 * streams so they play with the correct content type. Shared by the inline carousel
 * slide and the full-screen video modal so both resolve sources identically.
 */
export function getVideoSource(uri: string): VideoSource {
  const normalizedUri = uri.split('?')[0]?.toLowerCase() ?? uri.toLowerCase();

  return {
    uri,
    contentType: normalizedUri.endsWith('.m3u8') ? 'hls' : 'progressive',
  };
}
