import { StyleSheet } from 'react-native';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BlogContentImage } from './blog-content-image';

// Oranlar uygulama genelindeki önbellekte görsel adresine göre tutulduğu için her test kendi adresini kullanır.
const imageUrl = (name: string) => `https://blog.haydigiy.com/uploads/${name}.webp`;

const frameAspectRatio = () =>
  StyleSheet.flatten(screen.getByTestId('blog-content-image').props.style).aspectRatio;

const loadImage = (width: number, height: number) =>
  act(() => {
    fireEvent(screen.getByLabelText('Kombin önerisi'), 'load', {
      nativeEvent: { cacheType: 'none', source: { height, mediaType: null, url: '', width } },
    });
  });

describe('BlogContentImage', () => {
  it('reserves a 4:3 box and switches to the image ratio once it loads', () => {
    renderWithTamagui(<BlogContentImage alt="Kombin önerisi" src={imageUrl('a')} />);

    expect(frameAspectRatio()).toBeCloseTo(4 / 3);

    loadImage(1200, 1800);

    expect(frameAspectRatio()).toBeCloseTo(2 / 3);
  });

  // Regresyon: Android'de expo-image, kutuya göre küçültülüp yuvarlanmış bitmap boyutunu bildirir. Oran her
  // yüklemede güncellendiğinde kutu yeniden boyutlanıyor, görsel yeniden yükleniyor ve döngü hiç durmuyordu.
  it('keeps the first measured ratio when the reload at the new box size reports another size', () => {
    renderWithTamagui(<BlogContentImage alt="Kombin önerisi" src={imageUrl('b')} />);

    loadImage(1200, 1800);
    const measured = frameAspectRatio();

    loadImage(733, 1099);

    expect(frameAspectRatio()).toBe(measured);
  });

  it('hides the image instead of leaving an empty box when it fails to load', () => {
    renderWithTamagui(<BlogContentImage alt="Kombin önerisi" src={imageUrl('c')} />);

    act(() => {
      fireEvent(screen.getByLabelText('Kombin önerisi'), 'error', { nativeEvent: { error: 'HTTP 404' } });
    });

    expect(screen.queryByTestId('blog-content-image')).toBeNull();
  });
});
