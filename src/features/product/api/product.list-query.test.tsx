import { PropsWithChildren } from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInfiniteSearchProductsQuery } from './product.queries';
import { searchProductDtos } from '@/services/product.service';

jest.mock('@/services/product.service', () => ({
  getProductByIdDto: jest.fn(),
  getProductReviewPageDto: jest.fn(),
  getProductReviews: jest.fn(),
  getSearchSuggestions: jest.fn(),
  listFeaturedProductDtos: jest.fn(),
  searchProductDtos: jest.fn(),
}));

jest.mock('@/services/popular-products.service', () => ({
  listPopularProductDtos: jest.fn(),
}));

jest.mock('./product.mapper', () => ({
  mapAvailableFilters: jest.fn(() => null),
  mapPopularProductDto: jest.fn(),
  mapProductDto: jest.fn(),
  mapSearchProductDto: jest.fn((dto: unknown) => dto),
  mergeProductDetailReviewPage: jest.fn(),
}));

const mockedSearch = jest.mocked(searchProductDtos);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useInfiniteSearchProductsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards the supplier code to the listing request', async () => {
    mockedSearch.mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 });

    const { result } = renderHook(() => useInfiniteSearchProductsQuery({ s: '123' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedSearch).toHaveBeenCalledWith({ s: '123', page: 1 });
  });

  it('exposes the menu item name for menu-based listings', async () => {
    mockedSearch.mockResolvedValue({
      data: [],
      menu_item: { name: 'Çok Satanlar' },
      current_page: 1,
      last_page: 1,
      total: 0,
    });

    const { result } = renderHook(
      () => useInfiniteSearchProductsQuery({ menu_url: 'cok-satanlar' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].menuItemName).toBe('Çok Satanlar');
  });

  it('leaves the menu item name empty when the API sends none', async () => {
    mockedSearch.mockResolvedValue({ data: [], menu_item: null, total: 0 });

    const { result } = renderHook(() => useInfiniteSearchProductsQuery({ c: 40 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].menuItemName).toBeUndefined();
  });
});
