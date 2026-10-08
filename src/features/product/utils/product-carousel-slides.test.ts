import { getProductCarouselSlides } from './product-carousel-slides';

const MEDIUM = ['https://cdn/medium/a.webp', 'https://cdn/medium/b.webp'];
const LARGE = ['https://cdn/large/a.webp', 'https://cdn/large/b.webp'];

describe('getProductCarouselSlides', () => {
  it('shows the medium images as they are when no high-resolution version exists', () => {
    expect(getProductCarouselSlides(MEDIUM)).toEqual([
      { imageIndex: 0, key: `image-0-${MEDIUM[0]}`, placeholderUri: undefined, type: 'image', uri: MEDIUM[0] },
      { imageIndex: 1, key: `image-1-${MEDIUM[1]}`, placeholderUri: undefined, type: 'image', uri: MEDIUM[1] },
    ]);
  });

  it('loads the high-resolution image over the medium one, like the web', () => {
    const slides = getProductCarouselSlides(MEDIUM, null, LARGE);

    expect(slides[0]).toMatchObject({ placeholderUri: MEDIUM[0], uri: LARGE[0] });
    expect(slides[1]).toMatchObject({ placeholderUri: MEDIUM[1], uri: LARGE[1] });
  });

  it('keeps the slide keys on the medium image so the preview → full swap does not reset them', () => {
    const preview = getProductCarouselSlides([MEDIUM[0]]);
    const full = getProductCarouselSlides(MEDIUM, null, LARGE);

    expect(full[0].key).toBe(preview[0].key);
  });

  it('skips the placeholder when the high-resolution image is the same file', () => {
    const slides = getProductCarouselSlides(MEDIUM, null, [MEDIUM[0], '']);

    expect(slides[0]).toMatchObject({ placeholderUri: undefined, uri: MEDIUM[0] });
    expect(slides[1]).toMatchObject({ placeholderUri: undefined, uri: MEDIUM[1] });
  });

  it('pairs high-resolution images by their original position even when blanks are dropped', () => {
    const slides = getProductCarouselSlides(['', MEDIUM[1]], null, ['https://cdn/large/blank.webp', LARGE[1]]);

    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({ imageIndex: 0, placeholderUri: MEDIUM[1], uri: LARGE[1] });
  });

  it('appends the product video as the final slide', () => {
    const slides = getProductCarouselSlides(MEDIUM, 'https://cdn/video.mp4', LARGE);

    expect(slides[slides.length - 1]).toEqual({
      key: 'video-https://cdn/video.mp4',
      type: 'video',
      uri: 'https://cdn/video.mp4',
    });
  });
});
