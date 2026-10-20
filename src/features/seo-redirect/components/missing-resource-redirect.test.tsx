import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
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

const mockedQuery = jest.mocked(useSeoRedirectQuery);

function mockQueryResult(result: { data?: unknown; isPending: boolean }) {
  mockedQuery.mockReturnValue(result as never);
}

describe('MissingResourceRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
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
});
