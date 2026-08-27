import { renderHook, waitFor } from '@testing-library/react-native';
import { useLastViewedInsiderProduct } from './use-last-viewed-insider-product';
import { getViewedProducts } from '@/utils/recently-viewed';

jest.mock('@/utils/recently-viewed', () => ({
  getViewedProducts: jest.fn(),
}));

const getViewedProductsMock = getViewedProducts as jest.Mock;

beforeEach(() => {
  getViewedProductsMock.mockReset();
});

describe('useLastViewedInsiderProduct', () => {
  /**
   * Ana sayfadaki "Son Görüntülenenler" kampanyası ürünlü SDK metodunu gerektiriyor;
   * bağlam olarak en son gezilen ürün kullanılır.
   */
  it('maps the most recently viewed product to an Insider product', async () => {
    getViewedProductsMock.mockResolvedValue([
      { id: 42, name: 'Kadın Bluz', slug: 'kadin-bluz', thumb: 'https://cdn/1.jpg', price: '199.90' },
      { id: 43, name: 'Eski Ürün', slug: 'eski', price: '99' },
    ]);

    const { result } = renderHook(() => useLastViewedInsiderProduct());

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current).toMatchObject({
      id: '42',
      name: 'Kadın Bluz',
      price: 199.9,
      imageUrl: 'https://cdn/1.jpg',
    });
  });

  it('stays null when nothing has been viewed yet', async () => {
    getViewedProductsMock.mockResolvedValue([]);

    const { result } = renderHook(() => useLastViewedInsiderProduct());

    await waitFor(() => expect(getViewedProductsMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  /** Yerel kayıt okunamazsa öneri alanı sessizce boş kalmalı, ekran kırılmamalı. */
  it('stays null when the local store cannot be read', async () => {
    getViewedProductsMock.mockRejectedValue(new Error('storage bozuk'));

    const { result } = renderHook(() => useLastViewedInsiderProduct());

    await waitFor(() => expect(getViewedProductsMock).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });
});
