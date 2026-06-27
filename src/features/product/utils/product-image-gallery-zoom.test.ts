import { getFocusedZoomTranslate } from './product-image-gallery-zoom';

describe('product image gallery zoom helpers', () => {
  it('keeps center double tap centered', () => {
    expect(getFocusedZoomTranslate(400, 200, 2.4)).toBe(0);
  });

  it('moves the zoomed image toward the tapped point', () => {
    expect(getFocusedZoomTranslate(400, 100, 2.4)).toBe(140);
    expect(getFocusedZoomTranslate(400, 300, 2.4)).toBe(-140);
  });

  it('clamps focus translation inside the zoomable bounds', () => {
    expect(getFocusedZoomTranslate(400, -100, 2.4)).toBe(280);
    expect(getFocusedZoomTranslate(400, 500, 2.4)).toBe(-280);
  });
});
