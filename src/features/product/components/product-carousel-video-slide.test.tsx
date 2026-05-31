import { fireEvent, screen } from '@testing-library/react-native';
import { useVideoPlayer } from 'expo-video';
import { ProductCarouselVideoSlide } from './product-carousel-video-slide';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockedUseVideoPlayer = useVideoPlayer as jest.Mock;

describe('ProductCarouselVideoSlide', () => {
  beforeEach(() => {
    mockedUseVideoPlayer.mockClear();
  });

  it('uses a direct progressive source for remote mp4 videos', () => {
    renderWithTamagui(
      <ProductCarouselVideoSlide
        autoplayRequest={1}
        height={320}
        isActive
        uri="https://cdn.example.com/product-video.mp4"
        width={180}
      />,
    );

    const source = mockedUseVideoPlayer.mock.calls[0][0];
    expect(source).toEqual({
      uri: 'https://cdn.example.com/product-video.mp4',
      contentType: 'progressive',
    });
    expect(source).not.toHaveProperty('useCaching');
  });

  it('marks m3u8 sources as hls for iOS playback detection', () => {
    renderWithTamagui(
      <ProductCarouselVideoSlide
        autoplayRequest={1}
        height={320}
        isActive
        uri="https://cdn.example.com/product-video.m3u8?token=abc"
        width={180}
      />,
    );

    expect(mockedUseVideoPlayer.mock.calls[0][0]).toMatchObject({
      contentType: 'hls',
    });
  });

  it('uses textureView for inline Android rendering inside the carousel', () => {
    renderWithTamagui(
      <ProductCarouselVideoSlide
        autoplayRequest={1}
        height={320}
        isActive
        uri="https://cdn.example.com/product-video.mp4"
        width={180}
      />,
    );

    expect(screen.getByTestId('product-carousel-video').props.surfaceType).toBe('textureView');
  });

  it('renders a modal-opening preview instead of inline video when a handler is provided', () => {
    const onOpenPress = jest.fn();

    renderWithTamagui(
      <ProductCarouselVideoSlide
        autoplayRequest={1}
        height={320}
        isActive
        onOpenPress={onOpenPress}
        uri="https://cdn.example.com/product-video.mp4"
        width={180}
      />,
    );

    fireEvent.press(screen.getByLabelText('Ürün videosunu modalda aç'));

    expect(onOpenPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('product-carousel-video')).toBeNull();
    expect(mockedUseVideoPlayer).not.toHaveBeenCalled();
  });
});
