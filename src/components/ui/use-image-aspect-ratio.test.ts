import { act, renderHook } from '@testing-library/react-native';
import type { ImageLoadEventData } from 'expo-image';
import { createAspectRatioCache } from '@/utils/image-aspect-ratio-cache';
import { useImageAspectRatio } from './use-image-aspect-ratio';

const loadEvent = (width: number, height: number): ImageLoadEventData => ({
  cacheType: 'none',
  source: { height, mediaType: 'image/webp', url: 'https://cdn.example.com/a.webp', width },
});

describe('useImageAspectRatio', () => {
  it('starts with the fallback ratio and switches to the measured one on load', () => {
    const cache = createAspectRatioCache();
    const { result } = renderHook(() => useImageAspectRatio('a', 2, cache));

    expect(result.current.aspectRatio).toBe(2);

    act(() => result.current.onLoad(loadEvent(1080, 400)));

    expect(result.current.aspectRatio).toBeCloseTo(2.7);
    expect(cache.get('a')).toBeCloseTo(2.7);
  });

  it('reuses a ratio measured earlier when the image mounts again', () => {
    const cache = createAspectRatioCache();
    cache.set('a', 1.2);

    const { result } = renderHook(() => useImageAspectRatio('a', 2, cache));

    expect(result.current.aspectRatio).toBe(1.2);
  });

  it('does not carry the ratio over when a recycled cell shows another image', () => {
    const cache = createAspectRatioCache();
    const { result, rerender } = renderHook(
      ({ imageKey }: { imageKey: string }) => useImageAspectRatio(imageKey, 2, cache),
      { initialProps: { imageKey: 'a' } },
    );

    act(() => result.current.onLoad(loadEvent(1080, 900)));
    expect(result.current.aspectRatio).toBeCloseTo(1.2);

    rerender({ imageKey: 'b' });
    expect(result.current.aspectRatio).toBe(2);
  });

  // Regresyon: oran her yüklemede güncellendiğinde kutu yeniden boyutlanıp görsel yeniden yükleniyor,
  // decode edilen boyut biraz farklı geldiği için döngü hiç durmuyordu (sürekli decode ve çizim).
  it('measures each image once so a reload at the new box size cannot resize it again', () => {
    const cache = createAspectRatioCache();
    const { result } = renderHook(() => useImageAspectRatio('a', 2, cache));

    act(() => result.current.onLoad(loadEvent(1080, 700)));
    const measured = result.current.aspectRatio;

    // The reload after the resize reports the downsampled bitmap, rounded to whole pixels.
    act(() => result.current.onLoad(loadEvent(977, 633)));

    expect(result.current.aspectRatio).toBe(measured);
    expect(cache.get('a')).toBe(measured);
  });

  it('ignores load events without dimensions', () => {
    const cache = createAspectRatioCache();
    const { result } = renderHook(() => useImageAspectRatio('a', 2, cache));

    act(() => result.current.onLoad(loadEvent(0, 0)));

    expect(result.current.aspectRatio).toBe(2);
    expect(cache.get('a')).toBeUndefined();
  });
});
