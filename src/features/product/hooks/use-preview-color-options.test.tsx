import { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { productKeys } from '../api/product.keys';
import { Product, ProductColorOption } from '@/types/product.types';
import { findPreviewColorOptions, usePreviewColorOptions } from './use-preview-color-options';

const BLACK: ProductColorOption = { id: '11', imageUrl: 'https://cdn/black.webp', name: 'Siyah', price: 0, slug: 'elbise-siyah' };
const RED: ProductColorOption = { id: '12', imageUrl: 'https://cdn/red.webp', name: 'Kırmızı', price: 0, slug: 'elbise-kirmizi' };

function makeProduct(overrides: Partial<Product>): Product {
  return {
    brand: 'HaydiGiy',
    category: 'Elbise',
    currency: 'TRY',
    description: '',
    id: '11',
    imageUrl: 'https://cdn/black.webp',
    price: 499.99,
    rating: 0,
    reviewCount: 0,
    sellerName: 'HaydiGiy',
    shippingLabel: '',
    slug: 'elbise-siyah',
    title: 'Elbise Siyah',
    ...overrides,
  };
}

function seedList(queryClient: QueryClient, products: Product[]) {
  queryClient.setQueryData(productKeys.list({ q: 'elbise' }), {
    pageParams: [1],
    pages: [{ products, pagination: { current_page: 1, last_page: 1, per_page: 20, total: products.length } }],
  });
}

describe('findPreviewColorOptions', () => {
  it('uses the colours of the list card the product was opened from, like the web initialProduct', () => {
    const queryClient = new QueryClient();
    seedList(queryClient, [makeProduct({ id: '99', slug: 'baska-urun' }), makeProduct({ otherColors: [BLACK, RED] })]);

    expect(findPreviewColorOptions(queryClient, 'elbise-siyah')).toEqual([BLACK, RED]);
    expect(findPreviewColorOptions(queryClient, '11')).toEqual([BLACK, RED]);
  });

  it('reuses the open sibling colour detail when switching colours', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(productKeys.detail('elbise-siyah'), makeProduct({ otherColors: [BLACK, RED] }));

    expect(findPreviewColorOptions(queryClient, 'elbise-kirmizi')).toEqual([BLACK, RED]);
  });

  it('ignores a list card without colours and falls back to the sibling detail', () => {
    const queryClient = new QueryClient();
    seedList(queryClient, [makeProduct({ id: '12', otherColors: [], slug: 'elbise-kirmizi' })]);
    queryClient.setQueryData(productKeys.detail('elbise-siyah'), makeProduct({ otherColors: [BLACK, RED] }));

    expect(findPreviewColorOptions(queryClient, 'elbise-kirmizi')).toEqual([BLACK, RED]);
  });

  it('returns nothing when the cache does not know the product', () => {
    const queryClient = new QueryClient();
    seedList(queryClient, [makeProduct({ otherColors: [BLACK, RED] })]);
    queryClient.setQueryData(productKeys.detailReviews('elbise-kirmizi'), { reviews: [] });

    expect(findPreviewColorOptions(queryClient, 'bilinmeyen-urun')).toBeUndefined();
    expect(findPreviewColorOptions(queryClient, '')).toBeUndefined();
  });
});

describe('usePreviewColorOptions', () => {
  function renderWithClient(queryClient: QueryClient, idOrSlug: string, enabled: boolean) {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return renderHook(() => usePreviewColorOptions(idOrSlug, enabled), { wrapper });
  }

  it('reads the cached colours while the full detail is loading', () => {
    const queryClient = new QueryClient();
    seedList(queryClient, [makeProduct({ otherColors: [BLACK, RED] })]);

    expect(renderWithClient(queryClient, 'elbise-siyah', true).result.current).toEqual([BLACK, RED]);
  });

  it('stays empty once the full detail is in charge', () => {
    const queryClient = new QueryClient();
    seedList(queryClient, [makeProduct({ otherColors: [BLACK, RED] })]);

    expect(renderWithClient(queryClient, 'elbise-siyah', false).result.current).toBeUndefined();
  });
});
