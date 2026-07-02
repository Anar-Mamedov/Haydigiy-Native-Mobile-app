import { buildProductDetailRoute } from './product-detail-route';
import { Product } from '@/types/product.types';

const baseProduct: Product = {
  brand: 'HaydiGiy',
  category: 'Kadın',
  currency: 'TRY',
  description: '',
  id: '80321',
  imageUrl: 'https://example.com/a.png',
  price: 459.99,
  rating: 5,
  reviewCount: 0,
  sellerName: 'HaydiGiy',
  shippingLabel: 'Hızlı Kargo',
  slug: 'kimono-takim-bordo',
  title: 'Kimono Takım Bordo',
};

describe('buildProductDetailRoute', () => {
  it('navigates by slug so the detail query avoids the id→slug round-trip', () => {
    const route = buildProductDetailRoute(baseProduct);

    expect(route.pathname).toBe('/product/[id]');
    expect(route.params.id).toBe('kimono-takim-bordo');
  });

  it('falls back to the id when the slug is missing', () => {
    const route = buildProductDetailRoute({ ...baseProduct, slug: '' });

    expect(route.params.id).toBe('80321');
  });

  it('passes preview params for an instant render and stringifies the price', () => {
    const route = buildProductDetailRoute(baseProduct);

    expect(route.params).toMatchObject({
      title: 'Kimono Takım Bordo',
      price: '459.99',
      imageUrl: 'https://example.com/a.png',
      brand: 'HaydiGiy',
      sellerName: 'HaydiGiy',
      shippingLabel: 'Hızlı Kargo',
      imageIndex: '0',
    });
  });

  it('forwards the image index and uses that image as the preview', () => {
    const product = { ...baseProduct, images: ['img-0.png', 'img-1.png', 'img-2.png'] };
    const route = buildProductDetailRoute(product, 2);

    expect(route.params.imageIndex).toBe('2');
    expect(route.params.imageUrl).toBe('img-2.png');
  });

  it('falls back to index 0 / primary image for an invalid index', () => {
    const product = { ...baseProduct, images: ['img-0.png', 'img-1.png'] };
    const route = buildProductDetailRoute(product, -5);

    expect(route.params.imageIndex).toBe('0');
    expect(route.params.imageUrl).toBe('img-0.png');
  });

  it('builds a preview route from slim sources (similar products / color options)', () => {
    const route = buildProductDetailRoute({
      id: '42',
      slug: 'mavi-elbise',
      title: 'Mavi Elbise',
      price: 249.9,
      imageUrl: 'https://example.com/mavi.png',
    });

    expect(route.params).toMatchObject({
      id: 'mavi-elbise',
      title: 'Mavi Elbise',
      price: '249.9',
      imageUrl: 'https://example.com/mavi.png',
      shippingLabel: '',
    });
    expect(route.params.brand).toBeUndefined();
    expect(route.params.sellerName).toBeUndefined();
  });
});
