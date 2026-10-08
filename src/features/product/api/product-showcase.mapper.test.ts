import { getShowcaseProductKey, mapProductShowcaseContent } from './product-showcase.mapper';

describe('mapProductShowcaseContent', () => {
  it('maps the live "Öne Çıkanlar" payload into the screen model', () => {
    const showcase = mapProductShowcaseContent({
      title: 'Öne Çıkanlar',
      subtitle: '',
      button_text: '',
      button_link: '',
      items: [{ text: 'Öne Çıkanlar', products: [] }],
      products: [
        {
          id: 39561,
          name: 'Dabıl Bağcıklı Pantolon Siyah - 20138.1884.',
          price: '₺219,99',
          url: 'https://haydigiy.com/dabil-bagcikli-pantolon-siyah-201381884',
          image: 'https://cdn.haydigiy.com/uploads/pantolon.webp',
          is_pinned: false,
        },
      ],
    });

    expect(showcase).toEqual({
      ctaLabel: '',
      ctaLink: '',
      subtitle: '',
      title: 'Öne Çıkanlar',
      products: [
        {
          discountRate: undefined,
          firstPrice: undefined,
          hasDiscount: false,
          id: '39561',
          imageUrl: 'https://cdn.haydigiy.com/uploads/pantolon.webp',
          price: 219.99,
          slug: 'dabil-bagcikli-pantolon-siyah-201381884',
          title: 'Dabıl Bağcıklı Pantolon Siyah - 20138.1884.',
        },
      ],
    });
  });

  it('parses Turkish thousands separators in formatted prices', () => {
    const [product] = mapProductShowcaseContent({
      products: [{ id: 1, price: '₺1.219,99', url: '/urun-a' }],
    }).products;

    expect(product.price).toBe(1219.99);
  });

  it('derives the discount from first_price like the web showcase', () => {
    const [product] = mapProductShowcaseContent({
      products: [{ id: 1, price: '150,00', first_price: '200,00', url: '/urun-a' }],
    }).products;

    expect(product).toMatchObject({ discountRate: 25, firstPrice: 200, hasDiscount: true, price: 150 });
  });

  it('falls back to the legacy items[0] fields when section fields are missing', () => {
    const showcase = mapProductShowcaseContent({
      items: [
        {
          text: 'Yeni Gelenler',
          subtitle: 'Bu hafta',
          button_text: 'Tümünü Gör',
          link: '/yeni-gelenler?c=208',
          products: [{ id: 7, title: 'Body', price: 99, link: '/product/body-siyah' }],
        },
      ],
    });

    expect(showcase).toMatchObject({
      ctaLabel: 'Tümünü Gör',
      ctaLink: '/yeni-gelenler?c=208',
      subtitle: 'Bu hafta',
      title: 'Yeni Gelenler',
    });
    expect(showcase.products[0]).toMatchObject({ id: '7', slug: 'body-siyah', title: 'Body' });
  });

  it('drops products that can be neither opened nor added to the cart', () => {
    const showcase = mapProductShowcaseContent({
      products: [
        { name: 'Kimliksiz', url: '#' },
        { id: 0, name: 'Sıfır kimlik' },
        { id: 5, name: 'Slugsız' },
      ],
    });

    expect(showcase.products).toHaveLength(1);
    expect(showcase.products[0]).toMatchObject({ id: '5', slug: '' });
  });

  it('returns an empty showcase for missing content', () => {
    expect(mapProductShowcaseContent(null)).toEqual({
      ctaLabel: '',
      ctaLink: '',
      products: [],
      subtitle: '',
      title: '',
    });
  });
});

describe('getShowcaseProductKey', () => {
  it('prefers the slug so the detail screen skips the id→slug request', () => {
    expect(getShowcaseProductKey({ id: '5', slug: 'urun-a' })).toBe('urun-a');
    expect(getShowcaseProductKey({ id: '5', slug: '' })).toBe('5');
  });
});
