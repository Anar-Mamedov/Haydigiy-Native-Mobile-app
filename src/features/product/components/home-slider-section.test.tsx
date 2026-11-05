import { PixelRatio } from 'react-native';
import { act, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { StoryContent } from '@/types/page-design.types';
import { HomeSliderSection } from './home-slider-section';

jest.mock('@/utils/link-handler', () => ({ handleLinkPress: jest.fn() }));

const SLIDE_COUNT = 8;

const content: StoryContent = {
  items: Array.from({ length: SLIDE_COUNT }, (_, index) => ({
    image: `https://cdn.haydigiy.com/banners/slide-${index}.webp`,
    title: `Kampanya ${index}`,
  })),
};

const mountedSlideImages = () =>
  screen.getAllByTestId('home-slider-image').map((image) => image.props.source[0].uri as string);

const slideIndexes = () =>
  mountedSlideImages()
    .map((uri) => Number(uri.match(/slide-(\d+)/)?.[1]))
    .sort((a, b) => a - b);

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(PixelRatio, 'getPixelSizeForLayoutSize').mockImplementation((size) => Math.round(size * 2.625));
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('HomeSliderSection', () => {
  it('mounts images only for the active slide and its neighbours', () => {
    renderWithTamagui(<HomeSliderSection content={content} />);

    // Every slide keeps its frame (paging and indicators stay intact)...
    expect(screen.getAllByLabelText(/^Kampanya \d$/)).toHaveLength(SLIDE_COUNT);
    // ...but only the active slide, the next one and the one autoplay wraps back to hold a bitmap.
    expect(slideIndexes()).toEqual([0, 1, 7]);
  });

  it('moves the window along with autoplay', () => {
    renderWithTamagui(<HomeSliderSection content={content} />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(slideIndexes()).toEqual([0, 1, 2]);
  });

  it('requests slides at the slider width instead of the full-size source', () => {
    renderWithTamagui(<HomeSliderSection content={content} />);

    // Initial width 300 dp × 2.625 ≈ 788 px → 828 px bucket.
    expect(mountedSlideImages()[0]).toBe(
      'https://cdn.haydigiy.com/cdn-cgi/image/width=828,quality=80,format=webp,fit=scale-down/banners/slide-0.webp',
    );
  });

  it('renders nothing without slides', () => {
    renderWithTamagui(<HomeSliderSection content={{ items: [] }} />);

    expect(screen.queryByTestId('home-slider-image')).toBeNull();
  });
});
