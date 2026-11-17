import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { useCategorySlugIndexQuery } from '@/features/category/api/category.queries';
import type { CategorySlugEntry, CategorySlugIndex } from '@/types/category-slug-index.types';
import { useSeoRedirectQuery } from '../api/seo-redirect.queries';
import { MissingResourceRedirect } from './missing-resource-redirect';

const mockRedirect = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock('@/features/promotions/components/top-banner', () => ({
  TopBanner: () => null,
}));

jest.mock('../api/seo-redirect.queries', () => ({
  useSeoRedirectQuery: jest.fn(),
}));

jest.mock('@/features/category/api/category.queries', () => ({
  useCategorySlugIndexQuery: jest.fn(),
}));

const mockedQuery = jest.mocked(useSeoRedirectQuery);
const mockedCategoryQuery = jest.mocked(useCategorySlugIndexQuery);

function mockQueryResult(result: { data?: unknown; isPending: boolean }) {
  mockedQuery.mockReturnValue(result as never);
}

function mockCategoryIndex(result: { data?: CategorySlugIndex; isPending: boolean }) {
  mockedCategoryQuery.mockReturnValue(result as never);
}

function buildIndex(entries: CategorySlugEntry[]): CategorySlugIndex {
  return {
    byId: new Map(entries.map((entry) => [entry.id, entry])),
    bySlug: new Map(entries.map((entry) => [entry.slug, entry])),
  };
}

const CATEGORY_INDEX = buildIndex([
  { id: 187, slug: 'kadin-elbise' },
  { id: 31, slug: 'kadin-buyuk-beden-3' },
]);

describe('MissingResourceRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    mockCategoryIndex({ data: CATEGORY_INDEX, isPending: false });
  });

  it('shows a loading state while the redirect rule is being resolved', () => {
    mockQueryResult({ data: undefined, isPending: true });

    renderWithTamagui(<MissingResourceRedirect queryString="c=216" webPath="/kolye-kupe-bileklik" />);

    expect(screen.getByText('Sayfa yükleniyor...')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockedQuery).toHaveBeenCalledWith(
      { path: '/kolye-kupe-bileklik', queryString: 'c=216' },
      { enabled: true },
    );
  });

  it('replaces the dead page with the redirect target', () => {
    mockQueryResult({
      data: { matched: true, statusCode: 301, targetUrl: '/kadin-aksesuar?c=1' },
      isPending: false,
    });

    renderWithTamagui(<MissingResourceRedirect queryString="c=216" webPath="/kolye-kupe-bileklik" />);

    expect(mockRedirect).toHaveBeenCalledWith('/kategori/kadin-aksesuar?c=1&seo_redirect_hop=1');
  });

  it('opens the 404 screen when no rule matches', () => {
    mockQueryResult({ data: { matched: false }, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/eski-urun" />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('opens the 404 screen when the resolve request fails or times out', () => {
    mockQueryResult({ data: undefined, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/eski-urun" />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('opens the 404 screen when the rule points back to the same page', () => {
    mockQueryResult({ data: { matched: true, statusCode: 301, targetUrl: '/eski-urun' }, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/eski-urun" />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('counts the hops of a redirect chain', () => {
    mockParams = { seo_redirect_hop: '1' };
    mockQueryResult({ data: { matched: true, statusCode: 301, targetUrl: '/son-urun' }, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/ara-urun" />);

    expect(mockRedirect).toHaveBeenCalledWith('/product/son-urun?seo_redirect_hop=2');
  });

  it('stops following redirects after the hop limit', () => {
    mockParams = { seo_redirect_hop: '2' };
    mockQueryResult({ data: undefined, isPending: true });

    renderWithTamagui(<MissingResourceRedirect webPath="/dongudeki-urun" />);

    expect(mockedQuery).toHaveBeenCalledWith({ path: '/dongudeki-urun', queryString: '' }, { enabled: false });
    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('does not ask for a rule without a web path', () => {
    mockQueryResult({ data: undefined, isPending: true });

    renderWithTamagui(<MissingResourceRedirect webPath="" />);

    expect(mockedQuery).toHaveBeenCalledWith({ path: '', queryString: '' }, { enabled: false });
    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('does not look up categories while the redirect rule is pending or when a rule matched', () => {
    mockQueryResult({ data: undefined, isPending: true });
    renderWithTamagui(<MissingResourceRedirect webPath="/kadin-elbise" />);
    expect(mockedCategoryQuery).toHaveBeenLastCalledWith({ enabled: false });

    mockQueryResult({ data: { matched: true, statusCode: 301, targetUrl: '/kadin-aksesuar?c=1' }, isPending: false });
    renderWithTamagui(<MissingResourceRedirect webPath="/kadin-elbise" />);
    expect(mockedCategoryQuery).toHaveBeenLastCalledWith({ enabled: false });
    expect(mockRedirect).toHaveBeenLastCalledWith('/kategori/kadin-aksesuar?c=1&seo_redirect_hop=1');
  });

  it('opens the category listing for a category link without its id', () => {
    mockQueryResult({ data: { matched: false }, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/kadin-elbise" />);

    expect(mockedCategoryQuery).toHaveBeenLastCalledWith({ enabled: true });
    expect(mockRedirect).toHaveBeenCalledWith('/kategori/kadin-elbise?c=187&seo_redirect_hop=1');
  });

  it('opens the category listing for a category slug that ends with digits', () => {
    mockQueryResult({ data: { matched: false }, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/kadin-buyuk-beden-3" />);

    expect(mockRedirect).toHaveBeenCalledWith('/kategori/kadin-buyuk-beden-3?c=31&seo_redirect_hop=1');
  });

  it('keeps the loading state while the category tree is loading', () => {
    mockQueryResult({ data: { matched: false }, isPending: false });
    mockCategoryIndex({ data: undefined, isPending: true });

    renderWithTamagui(<MissingResourceRedirect webPath="/kadin-elbise" />);

    expect(screen.getByText('Sayfa yükleniyor...')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('opens the 404 screen when the category tree cannot be loaded', () => {
    mockQueryResult({ data: { matched: false }, isPending: false });
    mockCategoryIndex({ data: undefined, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/kadin-elbise" />);

    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });

  it('does not look up categories for multi-segment paths', () => {
    mockQueryResult({ data: { matched: false }, isPending: false });

    renderWithTamagui(<MissingResourceRedirect webPath="/s/123" />);

    expect(mockedCategoryQuery).toHaveBeenLastCalledWith({ enabled: false });
    expect(mockRedirect).toHaveBeenCalledWith('/not-found');
  });
});
