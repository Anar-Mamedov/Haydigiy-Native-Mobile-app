import {
  CAROUSEL_ASPECT_RATIO,
  CAROUSEL_HORIZONTAL_PADDING,
  getCarouselImageHeight,
  getCarouselItemWidth,
} from './product-carousel-geometry';

describe('product carousel geometry', () => {
  it('insets the item width by the horizontal padding on both sides', () => {
    expect(getCarouselItemWidth(400)).toBe(400 - CAROUSEL_HORIZONTAL_PADDING * 2);
  });

  it('never returns a non-positive width for tiny screens', () => {
    expect(getCarouselItemWidth(10)).toBe(1);
  });

  it('derives the image height from the 2:3 aspect ratio', () => {
    const width = 430;
    expect(getCarouselImageHeight(width)).toBe(getCarouselItemWidth(width) * CAROUSEL_ASPECT_RATIO);
  });
});
