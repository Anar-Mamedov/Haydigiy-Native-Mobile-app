import { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductDetailsQuery } from './product.queries';
import {
  getCurrentSlugById,
  getProductDetailBySlug,
  getProductReviewPageDto,
} from '@/services/product.service';

jest.mock('@/services/product.service', () => ({
  getCurrentSlugById: jest.fn(),
  getProductByIdDto: jest.fn(),
  getProductDetailBySlug: jest.fn(),
  getProductReviewPageDto: jest.fn(),
  getProductReviews: jest.fn(),
  getSearchSuggestions: jest.fn(),
  searchProductDtos: jest.fn(),
  listFeaturedProductDtos: jest.fn(),
}));

jest.mock('@/services/popular-products.service', () => ({
  listPopularProductDtos: jest.fn(),
}));

jest.mock('./product.mapper', () => ({
  mapAvailableFilters: jest.fn(),
  mapPopularProductDto: jest.fn(),
  mapProductDetailDto: jest.fn((raw: unknown) => raw),
  mapProductDto: jest.fn(),
  mapSearchProductDto: jest.fn(),
  mergeProductDetailReviewPage: jest.fn((product: object, reviewPage: { reviews: unknown }) => ({
    ...product,
    reviews: reviewPage.reviews,
  })),
}));

const mockedGetDetail = jest.mocked(getProductDetailBySlug);
const mockedGetSlug = jest.mocked(getCurrentSlugById);
const mockedGetReviewPage = jest.mocked(getProductReviewPageDto);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useProductDetailsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves the detail without waiting for the review page request', async () => {
    mockedGetDetail.mockResolvedValue({ slug: 'elbise', reviewCount: 5, reviews: [] } as never);
    // Never resolves: variants/colors must still render from the detail alone.
    mockedGetReviewPage.mockReturnValue(new Promise(() => {}) as never);

    const { result } = renderHook(() => useProductDetailsQuery('elbise'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(result.current.data?.slug).toBe('elbise');
    expect(mockedGetReviewPage).toHaveBeenCalledWith('elbise');
  });

  it('merges the review page into the detail once it arrives', async () => {
    mockedGetDetail.mockResolvedValue({ slug: 'elbise', reviewCount: 2, reviews: [] } as never);
    mockedGetReviewPage.mockResolvedValue({ reviews: [{ id: 1 }] } as never);

    const { result } = renderHook(() => useProductDetailsQuery('elbise'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data?.reviews).toEqual([{ id: 1 }]));
  });

  it('skips the review request entirely when the product has no reviews', async () => {
    mockedGetDetail.mockResolvedValue({ slug: 'elbise', reviewCount: 0, reviews: [] } as never);

    const { result } = renderHook(() => useProductDetailsQuery('elbise'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(mockedGetReviewPage).not.toHaveBeenCalled();
  });

  it('resolves numeric route ids to slugs before fetching the detail', async () => {
    mockedGetSlug.mockResolvedValue({ success: true, slug: 'elbise' } as never);
    mockedGetDetail.mockResolvedValue({ slug: 'elbise', reviewCount: 0, reviews: [] } as never);

    const { result } = renderHook(() => useProductDetailsQuery('12345'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toBeTruthy());
    expect(mockedGetSlug).toHaveBeenCalledWith('12345');
    expect(mockedGetDetail).toHaveBeenCalledWith('elbise');
  });
});
