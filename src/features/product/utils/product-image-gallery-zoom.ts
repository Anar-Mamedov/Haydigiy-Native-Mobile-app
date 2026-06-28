export function clampGalleryZoomValue(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

export function getFocusedZoomTranslate(size: number, focalPoint: number, targetScale: number) {
  'worklet';
  const maxTranslate = (size * (targetScale - 1)) / 2;
  const focusedTranslate = (size / 2 - focalPoint) * (targetScale - 1);

  return clampGalleryZoomValue(focusedTranslate, -maxTranslate, maxTranslate);
}

export function getPinchZoomTranslate(
  size: number,
  focalPoint: number,
  startScale: number,
  targetScale: number,
  startTranslate: number,
) {
  'worklet';
  const safeStartScale = Math.max(startScale, 1);
  const focalFromCenter = focalPoint - size / 2;
  const contentPoint = (focalFromCenter - startTranslate) / safeStartScale;
  const nextTranslate = focalFromCenter - contentPoint * targetScale;
  const maxTranslate = (size * (targetScale - 1)) / 2;

  return clampGalleryZoomValue(nextTranslate, -maxTranslate, maxTranslate);
}
