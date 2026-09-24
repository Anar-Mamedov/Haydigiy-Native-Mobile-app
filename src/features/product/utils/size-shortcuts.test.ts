import { getNextSizeShortcutVariants, getSizeShortcuts, isSizeShortcutActive } from './size-shortcuts';

function sizeOf(label: string) {
  const shortcut = getSizeShortcuts(266).find((item) => item.label === label);
  if (!shortcut) throw new Error(`${label} bedeni tanımlı değil`);
  return shortcut;
}

describe('getSizeShortcuts', () => {
  it('lists S, M, L and XL for Beden İndirimli Ürünler (266)', () => {
    expect(getSizeShortcuts(266).map((shortcut) => shortcut.label)).toEqual(['S', 'M', 'L', 'XL']);
  });

  it('returns nothing for other or unknown categories', () => {
    expect(getSizeShortcuts(208)).toEqual([]);
    expect(getSizeShortcuts(undefined)).toEqual([]);
    expect(getSizeShortcuts(null)).toEqual([]);
  });
});

describe('getNextSizeShortcutVariants', () => {
  it('applies the same variant ids as the web links', () => {
    expect(getNextSizeShortcutVariants(sizeOf('S'), undefined)).toBe('256,234,31');
    expect(getNextSizeShortcutVariants(sizeOf('M'), undefined)).toBe('274,232,30');
    expect(getNextSizeShortcutVariants(sizeOf('L'), undefined)).toBe('273,233,29');
    expect(getNextSizeShortcutVariants(sizeOf('XL'), undefined)).toBe('273,235,28');
  });

  it('replaces another size selection', () => {
    expect(getNextSizeShortcutVariants(sizeOf('M'), '256,234,31')).toBe('274,232,30');
  });

  it('removes the size filter when the selected size is pressed again', () => {
    expect(getNextSizeShortcutVariants(sizeOf('S'), '31,256,234')).toBeUndefined();
  });
});

describe('isSizeShortcutActive', () => {
  it('matches the applied variants exactly, in any order', () => {
    expect(isSizeShortcutActive(sizeOf('S'), '31,256,234')).toBe(true);
    expect(isSizeShortcutActive(sizeOf('S'), '256,234')).toBe(false);
    expect(isSizeShortcutActive(sizeOf('S'), '256,234,31,232')).toBe(false);
    expect(isSizeShortcutActive(sizeOf('L'), '273,235,28')).toBe(false);
    expect(isSizeShortcutActive(sizeOf('S'), undefined)).toBe(false);
  });
});
