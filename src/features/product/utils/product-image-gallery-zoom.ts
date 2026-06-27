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
