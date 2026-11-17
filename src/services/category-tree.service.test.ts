import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { fetchCategoryTreeDto } from './category-tree.service';

jest.mock('@/lib/axios', () => ({
  apiClient: { get: jest.fn() },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

const mockedGet = jest.mocked(apiClient.get);

describe('fetchCategoryTreeDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appEnv.apiBaseUrl = 'https://api.test';
  });

  it('reads the tree from a `data` envelope with a short timeout', async () => {
    mockedGet.mockResolvedValue({ data: { data: [{ id: 187, slug: 'kadin-elbise' }] } });

    await expect(fetchCategoryTreeDto()).resolves.toEqual([{ id: 187, slug: 'kadin-elbise' }]);
    expect(mockedGet).toHaveBeenCalledWith('/categories', { timeout: 5000 });
  });

  it('accepts a bare array response', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 31, slug: 'kadin-buyuk-beden-3' }] });

    await expect(fetchCategoryTreeDto()).resolves.toEqual([{ id: 31, slug: 'kadin-buyuk-beden-3' }]);
  });

  it('returns an empty tree for an unexpected body', async () => {
    mockedGet.mockResolvedValue({ data: { data: null } });

    await expect(fetchCategoryTreeDto()).resolves.toEqual([]);
  });

  it('skips the request when the app runs on the mock catalog', async () => {
    appEnv.apiBaseUrl = '';

    await expect(fetchCategoryTreeDto()).resolves.toEqual([]);
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it('lets request failures reach the query so the screen can fall back to 404', async () => {
    mockedGet.mockRejectedValue(new Error('timeout'));

    await expect(fetchCategoryTreeDto()).rejects.toThrow('timeout');
  });
});
