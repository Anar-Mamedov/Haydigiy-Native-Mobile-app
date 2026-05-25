import { fireEvent, screen } from '@testing-library/react-native';
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
  it('opens the product when an image is tapped', () => {
    const onOpen = jest.fn();
    renderWithTamagui(<ProductImageCarousel images={images} onOpen={onOpen} title="Test" />);

    fireEvent.press(screen.getByLabelText('Test ürün görseli'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('advances the indicator as the images are scrolled', () => {
    renderWithTamagui(<ProductImageCarousel images={images} onOpen={jest.fn()} title="Test" />);

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
  });

  it('renders a single tappable image without a pager when there is one image', () => {
    const onOpen = jest.fn();
    renderWithTamagui(<ProductImageCarousel images={[images[0]]} onOpen={onOpen} title="Test" />);

    layout(200);
    expect(screen.queryByTestId('product-image-carousel-scroll')).toBeNull();

    fireEvent.press(screen.getByLabelText('Test ürün görseli'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
