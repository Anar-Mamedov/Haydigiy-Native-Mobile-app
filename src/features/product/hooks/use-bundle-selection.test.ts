import { act, renderHook } from '@testing-library/react-native';
import { useBundleSelection } from './use-bundle-selection';
import { BundleItem } from '@/types/bundle.types';

function makeItem(bundleItemId: number, variants: { id: string; stock: number }[]): BundleItem {
  const mapped = variants.map((variant, index) => ({
    key: `${variant.id}-${index}`,
    variantId: variant.id,
    name: variant.id,
    name2: null,
    stock: variant.stock,
    hasStock: variant.stock > 0,
  }));

  return {
    bundleItemId,
    productId: bundleItemId * 100,
    title: `Ürün ${bundleItemId}`,
    slug: null,
    imageUrl: '',
    price: 100,
    oldPrice: null,
    quantity: 1,
    isAvailable: mapped.some((variant) => variant.hasStock),
    variants: mapped,
  };
}

const multiSize = makeItem(1, [
  { id: '188200', stock: 5 },
  { id: '188201', stock: 3 },
]);
const singleSize = makeItem(2, [{ id: '175426', stock: 4 }]);

describe('useBundleSelection', () => {
  it('auto-selects an item that has exactly one in-stock size', () => {
    const { result } = renderHook(() => useBundleSelection([singleSize]));

    expect(result.current.selections[2]).toBe('175426');
    expect(result.current.isComplete).toBe(true);
  });

  it('does not auto-select when several sizes are available', () => {
    const { result } = renderHook(() => useBundleSelection([multiSize]));

    expect(result.current.selections[1]).toBeUndefined();
    expect(result.current.isComplete).toBe(false);
    expect(result.current.missingItemIds).toEqual([1]);
  });

  it('blocks completion until every item has a size', () => {
    const { result } = renderHook(() => useBundleSelection([multiSize, singleSize]));

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isComplete).toBe(false);

    act(() => result.current.selectVariant(1, '188201'));

    expect(result.current.selectedCount).toBe(2);
    expect(result.current.isComplete).toBe(true);
  });

  it('builds the selections payload only from chosen sizes', () => {
    const { result } = renderHook(() => useBundleSelection([multiSize, singleSize]));

    // Eksik seçim varken payload yalnızca seçilenleri taşır; istek gönderilmez.
    expect(result.current.selectionPayload).toEqual([{ bundleItemId: 2, variantId: '175426' }]);

    act(() => result.current.selectVariant(1, '188200'));

    expect(result.current.selectionPayload).toEqual([
      { bundleItemId: 1, variantId: '188200' },
      { bundleItemId: 2, variantId: '175426' },
    ]);
  });

  it('flags the first missing item and clears the flag on the next pick', () => {
    const { result } = renderHook(() => useBundleSelection([multiSize, singleSize]));

    let firstMissing: number | null = null;
    act(() => {
      firstMissing = result.current.flagMissingSelections();
    });

    expect(firstMissing).toBe(1);
    expect(result.current.missingHighlight).toBe(true);

    act(() => result.current.selectVariant(1, '188200'));
    expect(result.current.missingHighlight).toBe(false);
  });

  it('is not purchasable when any item is unavailable', () => {
    const soldOut = makeItem(3, [{ id: '999', stock: 0 }]);
    const { result } = renderHook(() => useBundleSelection([singleSize, soldOut]));

    expect(result.current.isPurchasable).toBe(false);
  });

  it('drops a manual pick that no longer exists after the items change', () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: BundleItem[] }) => useBundleSelection(items),
      { initialProps: { items: [multiSize] } },
    );

    act(() => result.current.selectVariant(1, '188201'));
    expect(result.current.selections[1]).toBe('188201');

    // Aynı kalem farklı varyantlarla geldi (renk değişimi vb.).
    rerender({ items: [makeItem(1, [{ id: '777', stock: 2 }])] });

    expect(result.current.selections[1]).toBe('777');
  });
});
