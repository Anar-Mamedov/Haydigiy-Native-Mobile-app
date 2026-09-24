/**
 * Kategori listesinde hızlı filtrelerin yanında gösterilen beden kısayolları (web ile aynı tanım).
 *
 * Her beden, o bedene denk gelen bütün varyant id'lerini birlikte seçer: harf bedeni, çift beden ve rakam
 * karşılığı (ör. S = S + S-M + 36). L-XL (273) bu yüzden hem L'de hem XL'de yer alır.
 */

export type SizeShortcut = {
  label: string;
  variantIds: readonly number[];
};

const SIZE_SHORTCUTS_BY_CATEGORY: Readonly<Record<number, readonly SizeShortcut[]>> = {
  // Beden İndirimli Ürünler
  266: [
    { label: 'S', variantIds: [256, 234, 31] },
    { label: 'M', variantIds: [274, 232, 30] },
    { label: 'L', variantIds: [273, 233, 29] },
    { label: 'XL', variantIds: [273, 235, 28] },
  ],
};

/** Kategoriye tanımlı beden kısayolları; tanım yoksa boş liste. */
export function getSizeShortcuts(categoryId: number | null | undefined): readonly SizeShortcut[] {
  if (!categoryId) return [];
  return SIZE_SHORTCUTS_BY_CATEGORY[categoryId] ?? [];
}

function parseVariantIds(variants: string | undefined): number[] {
  return variants
    ? variants
        .split(',')
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => Number.isInteger(id) && id > 0)
    : [];
}

/** Seçili bedenler kısayolun id'leriyle birebir aynıysa kısayol seçilidir; sıra önemsizdir. */
export function isSizeShortcutActive(shortcut: SizeShortcut, variants: string | undefined): boolean {
  const selected = new Set(parseVariantIds(variants));
  const own = new Set(shortcut.variantIds);
  return selected.size === own.size && [...own].every((id) => selected.has(id));
}

/**
 * Kısayola dokununca uygulanacak `variants` değeri. Seçili kısayola tekrar dokunmak beden filtresini kaldırır;
 * seçili değilse `variants` bu bedenin id'leriyle değiştirilir (web'deki `?variants=256,234,31` linkleriyle aynı).
 */
export function getNextSizeShortcutVariants(shortcut: SizeShortcut, variants: string | undefined): string | undefined {
  return isSizeShortcutActive(shortcut, variants) ? undefined : shortcut.variantIds.join(',');
}
