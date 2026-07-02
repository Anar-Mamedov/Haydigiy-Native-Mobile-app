import { fireEvent, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { ProductCarousel } from './product-carousel';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const images = [
  'https://example.com/product-a.jpg',
  'https://example.com/product-b.jpg',
  'https://example.com/product-c.jpg',
];

function renderCarousel(
  carouselImages = images,
  videoPath?: string,
  onVideoPress?: (videoUri: string) => void,
  initialIndex?: number,
) {
  return renderWithTamagui(
    <ProductCarousel
      images={carouselImages}
      initialIndex={initialIndex}
      isFavorite={false}
      onToggleFavorite={jest.fn()}
      onVideoPress={onVideoPress}
      productTitle="Test product"
      productSlug="test-product"
      videoPath={videoPath}
    />,
  );
}

function itemWidth() {
  return Math.max(Dimensions.get('window').width - 64, 1);
}

describe('ProductCarousel', () => {
  it('loops from the last image back to the first when advancing', () => {
    renderCarousel();

    fireEvent.press(screen.getByLabelText('Sonraki görsel'));
    fireEvent.press(screen.getByLabelText('Sonraki görsel'));
    expect(screen.getByLabelText('Slayt 3 / 3')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Sonraki görsel'));

    expect(screen.getByLabelText('Slayt 1 / 3')).toBeTruthy();
  });

  it('loops from the first image back to the last when going previous', () => {
    renderCarousel();

    fireEvent.press(screen.getByLabelText('Önceki görsel'));

    expect(screen.getByLabelText('Slayt 3 / 3')).toBeTruthy();
  });

  it('keeps swipe pagination circular at the cloned loop boundaries', () => {
    renderCarousel();

    fireEvent(screen.getByTestId('product-carousel-list'), 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: 0, y: 0 },
        layoutMeasurement: { width: itemWidth(), height: 300 },
        contentSize: { width: itemWidth() * (images.length + 2), height: 300 },
      },
    });
    expect(screen.getByLabelText('Slayt 3 / 3')).toBeTruthy();

    fireEvent(screen.getByTestId('product-carousel-list'), 'momentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: itemWidth() * (images.length + 1), y: 0 },
        layoutMeasurement: { width: itemWidth(), height: 300 },
        contentSize: { width: itemWidth() * (images.length + 2), height: 300 },
      },
    });
    expect(screen.getByLabelText('Slayt 1 / 3')).toBeTruthy();
  });

  it('uses the product video as the final slide and plays it in app', () => {
    // Open on the last image so the windowed list has the video cell mounted.
    renderCarousel(images, 'https://example.com/product-video.mp4', undefined, 2);

    fireEvent.press(screen.getByLabelText('Ürün videosunu oynat'));

    expect(screen.getByLabelText('Slayt 4 / 4')).toBeTruthy();
    expect(screen.getByTestId('product-carousel-video')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Sonraki görsel'));
    expect(screen.getByLabelText('Slayt 1 / 4')).toBeTruthy();
  });

  it('opens the provided video handler instead of jumping to the video slide', () => {
    const onVideoPress = jest.fn();
    renderCarousel(images, 'https://example.com/product-video.mp4', onVideoPress);

    fireEvent.press(screen.getByLabelText('Ürün videosunu oynat'));

    expect(onVideoPress).toHaveBeenCalledWith('https://example.com/product-video.mp4');
    expect(screen.getByLabelText('Slayt 1 / 4')).toBeTruthy();
  });

  it('opens the provided video handler from the carousel video slide preview', () => {
    const onVideoPress = jest.fn();
    // Open on the last image so the windowed list has the video cell mounted.
    renderCarousel(images, 'https://example.com/product-video.mp4', onVideoPress, 2);

    fireEvent.press(screen.getByLabelText('Sonraki görsel'));
    expect(screen.getByLabelText('Slayt 4 / 4')).toBeTruthy();

    fireEvent.press(screen.getAllByLabelText('Ürün videosunu modalda aç')[0]);

    expect(onVideoPress).toHaveBeenCalledWith('https://example.com/product-video.mp4');
  });

  it('bounds the initial render window so all images do not mount at screen open', () => {
    renderCarousel();

    const list = screen.getByTestId('product-carousel-list');
    expect(list.props.initialNumToRender).toBe(2);
    expect(list.props.maxToRenderPerBatch).toBe(3);
    expect(list.props.windowSize).toBe(5);
  });

  it('does not render loop controls for a single image', () => {
    renderCarousel([images[0]]);

    expect(screen.queryByLabelText('Sonraki görsel')).toBeNull();
    expect(screen.queryByLabelText('Önceki görsel')).toBeNull();
  });

  it('opens on the provided initial image index', () => {
    renderWithTamagui(
      <ProductCarousel
        images={images}
        initialIndex={1}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
        productTitle="Test product"
        productSlug="test-product"
      />,
    );

    expect(screen.getByLabelText('Slayt 2 / 3')).toBeTruthy();
  });

  it('opens the full-screen image viewer from the tapped image index', () => {
    const onImagePress = jest.fn();
    renderWithTamagui(
      <ProductCarousel
        images={images}
        isFavorite={false}
        onImagePress={onImagePress}
        onToggleFavorite={jest.fn()}
        productTitle="Test product"
        productSlug="test-product"
      />,
    );

    fireEvent.press(screen.getByLabelText('2. görseli tam ekranda aç'));

    expect(onImagePress).toHaveBeenCalledWith(1);
  });

  it('clamps an out-of-range initial index to the available images (never the video)', () => {
    renderWithTamagui(
      <ProductCarousel
        images={images}
        initialIndex={99}
        isFavorite={false}
        onToggleFavorite={jest.fn()}
        productTitle="Test product"
        productSlug="test-product"
        videoPath="https://example.com/product-video.mp4"
      />,
    );

    // 3 images + 1 video = 4 slides; index clamps to the last image, not the video.
    expect(screen.getByLabelText('Slayt 3 / 4')).toBeTruthy();
  });
});
