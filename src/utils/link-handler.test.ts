import { Linking } from 'react-native';
import { handleLinkPress, isInAppLink } from './link-handler';

const mockPush = jest.fn();
const mockDismissTo = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    dismissTo: (...args: unknown[]) => mockDismissTo(...args),
    push: (...args: unknown[]) => mockPush(...args),
  },
}));

describe('handleLinkPress', () => {
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    openURL.mockRestore();
  });

  it('ignores empty and placeholder links', () => {
    handleLinkPress(undefined);
    handleLinkPress(null);
    handleLinkPress('');
    handleLinkPress('#');
    handleLinkPress('javascript:void(0)');

    expect(mockPush).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
  });

  it('opens category menu links on the listing route with their query', () => {
    handleLinkPress('/yeni-sezon?c=72');
    expect(mockPush).toHaveBeenLastCalledWith('/kategori/yeni-sezon?c=72');

    handleLinkPress('/kategori/c-72?c=72');
    expect(mockPush).toHaveBeenLastCalledWith('/kategori/c-72?c=72');
  });

  it('opens a root product slug as a product instead of an empty listing', () => {
    // Regresyon: `/elbise-xyz` kategorisiz bir liste olarak açılıyordu.
    handleLinkPress('/triko-elbise-bordo-19071247');

    expect(mockPush).toHaveBeenCalledWith('/product/triko-elbise-bordo-19071247');
  });

  it.each([
    ['/s/123', '/s/123'],
    ['/blog/kis-kombinleri', '/blog/kis-kombinleri'],
    ['/blog', '/blog'],
    ['/hakkimizda', '/bilgi/hakkimizda'],
    ['/subeden-al', '/bilgi/subeden-al'],
    ['/yardim?kategori=iptal-iade', '/help?kategori=iptal-iade'],
    ['/search?q=elbise', '/kategori/search?q=elbise'],
    ['/sepet', '/cart'],
  ])('routes the banner link %s to %s', (link, route) => {
    handleLinkPress(link);

    expect(mockPush).toHaveBeenCalledWith(route);
    expect(openURL).not.toHaveBeenCalled();
  });

  it.each(['/', '/kariyer', 'https://haydigiy.com/'])(
    'returns home for %s instead of stacking another home screen',
    (link) => {
      handleLinkPress(link);

      expect(mockDismissTo).toHaveBeenCalledWith('/');
      expect(mockPush).not.toHaveBeenCalled();
    },
  );

  it('accepts CMS paths written without a leading slash', () => {
    handleLinkPress('elbise?c=40');

    expect(mockPush).toHaveBeenCalledWith('/kategori/elbise?c=40');
  });

  it('keeps absolute haydigiy.com links inside the app', () => {
    handleLinkPress('https://www.haydigiy.com/kis-kampanyasi?c=261&sorting=4');

    expect(mockPush).toHaveBeenCalledWith('/kategori/kis-kampanyasi?c=261&sorting=4');
    expect(openURL).not.toHaveBeenCalled();
  });

  it('opens other sites and device schemes externally', () => {
    handleLinkPress('https://www.instagram.com/haydigiy');
    handleLinkPress('tel:+908502590449');

    expect(openURL).toHaveBeenCalledWith('https://www.instagram.com/haydigiy');
    expect(openURL).toHaveBeenCalledWith('tel:+908502590449');
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('isInAppLink', () => {
  it('recognises store hosts regardless of case, port or credentials', () => {
    expect(isInAppLink('https://HAYDIGIY.com/sepet')).toBe(true);
    expect(isInAppLink('https://haydigiy.com:443/sepet')).toBe(true);
    expect(isInAppLink('https://user@www.haydigiy.com')).toBe(true);
  });

  it('does not treat look-alike or other hosts as the store', () => {
    expect(isInAppLink('https://haydigiy.com.evil.example/sepet')).toBe(false);
    expect(isInAppLink('https://cdn.haydigiy.com/kampanya.pdf')).toBe(false);
  });

  it('keeps the app custom scheme and plain paths in the app', () => {
    expect(isInAppLink('haydigiywebviewapp://cart')).toBe(true);
    expect(isInAppLink('/hakkimizda')).toBe(true);
    expect(isInAppLink('mailto:info@haydigiy.com')).toBe(false);
  });
});
