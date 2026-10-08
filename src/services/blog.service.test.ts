import { AxiosError, AxiosHeaders } from 'axios';
import { blogApiClient } from '@/lib/blog-api-client';
import { buildBlogPostListQuery, getBlogCategoriesDto, getBlogPostDto, getBlogPostsDto } from './blog.service';

jest.mock('@/lib/blog-api-client', () => ({
  blogApiClient: { get: jest.fn() },
}));

const mockGet = blogApiClient.get as jest.Mock;

function axiosError(status: number) {
  return new AxiosError('fail', String(status), undefined, undefined, {
    config: { headers: new AxiosHeaders() },
    data: {},
    headers: {},
    status,
    statusText: '',
  });
}

describe('blog.service', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('builds the published list query with an optional category slug', () => {
    expect(buildBlogPostListQuery({ page: 2 })).toEqual({ status: 'published', page: 2 });
    expect(buildBlogPostListQuery({ page: 1, categorySlug: ' kazak ' })).toEqual({
      status: 'published',
      page: 1,
      category_slug: 'kazak',
    });
    expect(buildBlogPostListQuery({ page: 1, categorySlug: '' })).toEqual({ status: 'published', page: 1 });
  });

  it('requests a page of published posts', async () => {
    mockGet.mockResolvedValue({ data: { data: [], pagination: { current_page: 3 } } });

    await expect(getBlogPostsDto({ page: 3, categorySlug: 'kombin' })).resolves.toEqual({
      data: [],
      pagination: { current_page: 3 },
    });
    expect(mockGet).toHaveBeenCalledWith('/blog/posts', {
      params: { status: 'published', page: 3, category_slug: 'kombin' },
    });
  });

  it('encodes the slug and unwraps a single post', async () => {
    mockGet.mockResolvedValue({ data: { data: { id: '1', slug: 'a b' } } });

    await expect(getBlogPostDto('a b')).resolves.toEqual({ id: '1', slug: 'a b' });
    expect(mockGet).toHaveBeenCalledWith('/blog/posts/a%20b');
  });

  it('returns null for a missing post but rethrows other failures', async () => {
    mockGet.mockRejectedValueOnce(axiosError(404));
    await expect(getBlogPostDto('yok')).resolves.toBeNull();

    const serverError = axiosError(500);
    mockGet.mockRejectedValueOnce(serverError);
    await expect(getBlogPostDto('hata')).rejects.toBe(serverError);
  });

  it('requests active categories and tolerates a malformed payload', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [{ id: 1, title: 'Kombin' }] } });
    await expect(getBlogCategoriesDto()).resolves.toEqual([{ id: 1, title: 'Kombin' }]);
    expect(mockGet).toHaveBeenCalledWith('/blog/categories', { params: { status: 'active' } });

    mockGet.mockResolvedValueOnce({ data: { data: null } });
    await expect(getBlogCategoriesDto()).resolves.toEqual([]);
  });
});
