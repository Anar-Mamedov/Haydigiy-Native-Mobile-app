import { act, fireEvent, screen } from '@testing-library/react-native';
import { ProductImageCarousel } from './product-image-carousel';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const images = [
  'https://example.com/p1-a.png',
  'https://example.com/p1-b.png',
  'https://example.com/p1-c.png',
];

function layout(width: number) {
  fireEvent(screen.getByTestId('product-image-carousel'), 'layout', {
    nativeEvent: { layout: { width, height: 300, x: 0, y: 0 } },
  });
}

describe('ProductImageCarousel', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens the product when an image is tapped', () => {
    const onOpen = jest.fn();
    renderWithTamagui(
      <ProductImageCarousel images={images} onOpen={onOpen} productId="product-1" title="Test" />,
    );

    fireEvent.press(screen.getByLabelText('Test ürün görseli'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('advances the indicator and reports the index as the images are scrolled', () => {
    const onIndexChange = jest.fn();
    renderWithTamagui(
      <ProductImageCarousel
        images={images}
        onOpen={jest.fn()}
        onIndexChange={onIndexChange}
        productId="product-1"
        title="Test"
      />,
    );

    // The pager only renders once the container has a measured width
    layout(200);
    expect(screen.getByLabelText('Görsel 1 / 3')).toBeTruthy();

    fireEvent.scroll(screen.getByTestId('product-image-carousel-scroll'), {
      nativeEvent: {
        contentOffset: { x: 400, y: 0 },
        layoutMeasurement: { width: 200, height: 300 },
        contentSize: { width: 600, height: 300 },
      },
    });

    expect(screen.getByLabelText('Görsel 3 / 3')).toBeTruthy();
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
  });

  it('renders a single tappable image without a pager when there is one image', () => {
    const onOpen = jest.fn();
    renderWithTamagui(
      <ProductImageCarousel images={[images[0]]} onOpen={onOpen} productId="product-1" title="Test" />,
    );

    layout(200);
    expect(screen.queryByTestId('product-image-carousel-scroll')).toBeNull();

    fireEvent.press(screen.getByLabelText('Test ürün görseli'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('clears a recycled image and shows a spinner until the new product image loads', () => {
    const view = renderWithTamagui(
      <ProductImageCarousel images={[images[0]]} onOpen={jest.fn()} productId="product-1" title="İlk ürün" />,
    );

    const firstImage = screen.getByTestId('product-image-0');
    expect(firstImage.props.recyclingKey).toBe(`product-1:0:${images[0]}`);
    expect(screen.getByTestId('product-image-0-loading')).toBeTruthy();

    fireEvent(firstImage, 'load', {
      nativeEvent: {
        cacheType: 'memory',
        source: { height: 900, url: images[0], width: 600 },
      },
    });
    expect(screen.queryByTestId('product-image-0-loading')).toBeNull();

    fireEvent(firstImage, 'loadStart');
    expect(screen.queryByTestId('product-image-0-loading')).toBeNull();

    view.rerender(
      <ProductImageCarousel images={[images[1]]} onOpen={jest.fn()} productId="product-2" title="Yeni ürün" />,
    );

    const recycledImage = screen.getByTestId('product-image-0');
    expect(recycledImage.props.recyclingKey).toBe(`product-2:0:${images[1]}`);
    expect(screen.getByTestId('product-image-0-loading')).toBeTruthy();

    fireEvent(recycledImage, 'load', {
      nativeEvent: {
        cacheType: 'disk',
        source: { height: 900, url: images[1], width: 600 },
      },
    });
    expect(screen.queryByTestId('product-image-0-loading')).toBeNull();
  });

  it('does not start every carousel image request at the same time', () => {
    renderWithTamagui(
      <ProductImageCarousel images={images} onOpen={jest.fn()} productId="product-1" title="Test" />,
    );

    layout(200);

    expect(screen.getByTestId('product-image-0')).toBeTruthy();
    expect(screen.getByTestId('product-image-1')).toBeTruthy();
    expect(screen.queryByTestId('product-image-2')).toBeNull();
    expect(screen.getByTestId('product-image-deferred-2')).toBeTruthy();

    fireEvent.scroll(screen.getByTestId('product-image-carousel-scroll'), {
      nativeEvent: {
        contentOffset: { x: 400, y: 0 },
        layoutMeasurement: { width: 200, height: 300 },
        contentSize: { width: 600, height: 300 },
      },
    });

    expect(screen.queryByTestId('product-image-0')).toBeNull();
    expect(screen.getByTestId('product-image-1')).toBeTruthy();
    expect(screen.getByTestId('product-image-2')).toBeTruthy();
  });

  it('replaces the spinner with an error placeholder when the image request fails', () => {
    renderWithTamagui(
      <ProductImageCarousel images={[images[0]]} onOpen={jest.fn()} productId="product-1" title="Test" />,
    );

    fireEvent(screen.getByTestId('product-image-0'), 'error', {
      nativeEvent: { error: 'Image request failed' },
    });

    expect(screen.queryByTestId('product-image-0-loading')).toBeNull();
    expect(screen.getByTestId('product-image-0-error')).toBeTruthy();
  });

  it('stops an Android image spinner when the native request never completes', () => {
    jest.useFakeTimers();

    renderWithTamagui(
      <ProductImageCarousel images={[images[0]]} onOpen={jest.fn()} productId="product-1" title="Test" />,
    );

    expect(screen.getByTestId('product-image-0-loading')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(12_000);
    });

    expect(screen.queryByTestId('product-image-0-loading')).toBeNull();
    expect(screen.getByTestId('product-image-0-error')).toBeTruthy();
  });
});
