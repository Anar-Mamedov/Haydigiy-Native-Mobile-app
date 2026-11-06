import { PixelRatio, StyleSheet } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BannerContent } from '@/types/page-design.types';
import { HomeBannerSection } from './home-banner-section';

const mockHandleLinkPress = jest.fn();

jest.mock('@/utils/link-handler', () => ({
  handleLinkPress: (link: string | null | undefined) => mockHandleLinkPress(link),
}));

const bannerContent = (image: string, text = 'SEZON SONU'): BannerContent => ({
  items: [{ id: 1, image, link: '/sezon-sonu', text }],
});

const imageUri = () => screen.getByTestId('home-banner-image').props.source[0].uri;
const bannerAspectRatio = (label: string) =>
  StyleSheet.flatten(screen.getByLabelText(label).props.style).aspectRatio;

const loadImage = (width: number, height: number) =>
  act(() => {
    fireEvent(screen.getByTestId('home-banner-image'), 'load', {
      nativeEvent: { cacheType: 'none', source: { height, mediaType: null, url: '', width } },
    });
  });

beforeEach(() => {
  jest.spyOn(PixelRatio, 'getPixelSizeForLayoutSize').mockImplementation((size) => Math.round(size * 2.625));
  mockHandleLinkPress.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('HomeBannerSection', () => {
  it('shows CDN banners as stored, without Cloudflare image transformations', () => {
    renderWithTamagui(<HomeBannerSection content={bannerContent('https://cdn.haydigiy.com/banners/a.webp')} width={182.5} />);

    expect(imageUri()).toBe('https://cdn.haydigiy.com/banners/a.webp');
  });

  it('uses the pre-generated product variant that covers the banner width', () => {
    const large = 'https://cdn.haydigiy.com/uploads/2026/10/23/x/large/elbise.webp';
    renderWithTamagui(<HomeBannerSection content={bannerContent(large)} width={182.5} />);

    // 182.5 dp × 2.625 ≈ 479 px → medium (600 px).
    expect(imageUri()).toBe(large.replace('/large/', '/medium/'));
  });

  it('sizes the box from the loaded image and opens the banner link', () => {
    renderWithTamagui(<HomeBannerSection content={bannerContent('https://cdn.haydigiy.com/banners/b.webp')} width={370} />);

    expect(bannerAspectRatio('SEZON SONU')).toBe(2);
    loadImage(1080, 400);
    expect(bannerAspectRatio('SEZON SONU')).toBeCloseTo(2.7);

    fireEvent.press(screen.getByLabelText('SEZON SONU'));
    expect(mockHandleLinkPress).toHaveBeenCalledWith('/sezon-sonu');
  });

  // Sanallaştırılmış listede hücre başka bir banner için yeniden kullanılır ya da yeniden mount olur.
  it('keeps measured ratios per image across recycling and remounts', () => {
    const first = 'https://cdn.haydigiy.com/banners/c.webp';
    const second = 'https://cdn.haydigiy.com/banners/d.webp';
    const { rerender, unmount } = renderWithTamagui(<HomeBannerSection content={bannerContent(first)} width={370} />);

    loadImage(1080, 900);
    expect(bannerAspectRatio('SEZON SONU')).toBeCloseTo(1.2);

    rerender(<HomeBannerSection content={bannerContent(second)} width={370} />);
    expect(bannerAspectRatio('SEZON SONU')).toBe(2);

    unmount();
    renderWithTamagui(<HomeBannerSection content={bannerContent(first)} width={370} />);
    expect(bannerAspectRatio('SEZON SONU')).toBeCloseTo(1.2);
  });

  it('renders nothing for items without an image', () => {
    renderWithTamagui(<HomeBannerSection content={{ items: [{ id: 1, image: '' }] }} width={370} />);

    expect(screen.queryByTestId('home-banner-image')).toBeNull();
  });
});
