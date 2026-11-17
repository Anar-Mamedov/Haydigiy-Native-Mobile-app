import { toRoutePattern } from './route-pattern';

describe('toRoutePattern', () => {
  it('drops group segments and keeps dynamic segments unexpanded', () => {
    expect(toRoutePattern(['(tabs)', 'product', '[id]'])).toBe('/product/[id]');
  });

  it('keeps catch-all segments as they are', () => {
    expect(toRoutePattern(['[...slug]'])).toBe('/[...slug]');
  });

  it('returns the root for an empty or group-only route', () => {
    expect(toRoutePattern([])).toBe('/');
    expect(toRoutePattern(['(tabs)'])).toBe('/');
  });

  it('drops nested groups anywhere in the path', () => {
    expect(toRoutePattern(['(tabs)', 'account', '(settings)', 'profile'])).toBe('/account/profile');
  });
});
