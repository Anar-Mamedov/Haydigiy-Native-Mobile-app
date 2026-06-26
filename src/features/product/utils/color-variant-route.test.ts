import { resolveColorVariantTarget } from './color-variant-route';

describe('resolveColorVariantTarget', () => {
  it('navigates to the selected color variant slug when available', () => {
    expect(
      resolveColorVariantTarget({ slug: 'kirmizi-elbise', id: '99' }, 'siyah-elbise'),
    ).toBe('kirmizi-elbise');
  });

  it('falls back to the active product slug when the variant has no slug', () => {
    expect(
      resolveColorVariantTarget({ slug: '', id: '99' }, 'siyah-elbise'),
    ).toBe('siyah-elbise');
  });

  it('falls back to the variant id when no slug is available anywhere', () => {
    expect(resolveColorVariantTarget({ slug: '', id: '99' }, '')).toBe('99');
  });

  it('returns null when nothing usable is available so navigation is skipped', () => {
    expect(resolveColorVariantTarget({ slug: '', id: '' }, '')).toBeNull();
    expect(resolveColorVariantTarget({}, null)).toBeNull();
  });
});
