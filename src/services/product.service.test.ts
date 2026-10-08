import { searchProductDtos } from './product.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
  getRequiredApiBaseUrl: jest.fn(() => 'https://api.test'),
}));

const mockedGet = jest.mocked(apiClient.get);

describe('searchProductDtos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue({
      data: {
        data: [],
        category: null,
        menu_item: null,
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20,
      },
    } as never);
  });

  it('sends the supplier code as `s`, like the web supplier listing', async () => {
    await searchProductDtos({ s: '123', page: 1, sorting: '4' });

    expect(mockedGet).toHaveBeenCalledWith(
      '/search-products',
      expect.objectContaining({
        params: expect.objectContaining({ s: '123', page: 1, sorting: '4' }),
      }),
    );
  });

  it('sends the menu page key as `menu_url`', async () => {
    await searchProductDtos({ menu_url: 'cok-satanlar', page: 1 });

    expect(mockedGet).toHaveBeenCalledWith(
      '/search-products',
      expect.objectContaining({
        params: expect.objectContaining({ menu_url: 'cok-satanlar' }),
      }),
    );
  });

  it('returns the menu item so the listing can use its name as the title', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { data: [], menu_item: { name: 'Çok Satanlar' }, total: 0 },
    } as never);

    const response = await searchProductDtos({ menu_url: 'cok-satanlar', page: 1 });

    expect(response.menu_item).toEqual({ name: 'Çok Satanlar' });
  });
});
