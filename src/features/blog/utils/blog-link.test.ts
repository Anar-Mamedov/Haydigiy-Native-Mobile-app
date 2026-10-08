import { resolveBlogLinkTarget } from './blog-link';

jest.mock('@/utils/resolve-deep-link', () => ({
  resolveDeepLinkPath: (input: string) => `resolved:${input}`,
}));

describe('resolveBlogLinkTarget', () => {
  it('keeps haydigiy.com and app-relative links in the app through the shared deep-link mapping', () => {
    expect(resolveBlogLinkTarget('https://haydigiy.com/blog/kis-rehberi?utm=1')).toEqual({
      type: 'internal',
      path: 'resolved:https://haydigiy.com/blog/kis-rehberi?utm=1',
    });
    expect(resolveBlogLinkTarget('https://www.haydigiy.com')).toEqual({
      type: 'internal',
      path: 'resolved:https://www.haydigiy.com',
    });
    expect(resolveBlogLinkTarget('/sepet')).toEqual({ type: 'internal', path: 'resolved:/sepet' });
  });

  it('opens other web, mail and phone links externally', () => {
    expect(resolveBlogLinkTarget('https://instagram.com/haydigiy')).toEqual({
      type: 'external',
      url: 'https://instagram.com/haydigiy',
    });
    expect(resolveBlogLinkTarget('https://haydigiy.com.evil.example/x')).toEqual({
      type: 'external',
      url: 'https://haydigiy.com.evil.example/x',
    });
    expect(resolveBlogLinkTarget('mailto:info@haydigiy.com')).toEqual({
      type: 'external',
      url: 'mailto:info@haydigiy.com',
    });
  });

  it('ignores empty and unsupported links', () => {
    expect(resolveBlogLinkTarget(undefined)).toBeNull();
    expect(resolveBlogLinkTarget('javascript:alert(1)')).toBeNull();
    expect(resolveBlogLinkTarget('//evil.example.com')).toBeNull();
  });
});
