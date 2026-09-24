import { useCallback, useMemo } from 'react';
import {
  getNextSizeShortcutVariants,
  getSizeShortcuts,
  isSizeShortcutActive,
  SizeShortcut,
} from '../utils/size-shortcuts';

export type SizeShortcutItem = SizeShortcut & { isActive: boolean };

/** Filtre çubuğunun beden kısayolları için ihtiyaç duyduğu sözleşme. */
export type SizeShortcutFilter = {
  items: SizeShortcutItem[];
  toggle: (shortcut: SizeShortcut) => void;
};

/**
 * Kategoriye tanımlı beden kısayollarını seçili `variants` ile eşleştirir ve dokunulan kısayolun sonucunu
 * `onChangeVariants` ile bildirir. Filtre durumu ekranda kalır; hook yalnızca onu okuyup türetir.
 */
export function useSizeShortcutFilter(
  categoryId: number | null | undefined,
  variants: string | undefined,
  onChangeVariants: (variants: string | undefined) => void,
): SizeShortcutFilter {
  const items = useMemo(
    () =>
      getSizeShortcuts(categoryId).map((shortcut) => ({
        ...shortcut,
        isActive: isSizeShortcutActive(shortcut, variants),
      })),
    [categoryId, variants],
  );

  const toggle = useCallback(
    (shortcut: SizeShortcut) => onChangeVariants(getNextSizeShortcutVariants(shortcut, variants)),
    [onChangeVariants, variants],
  );

  return { items, toggle };
}
