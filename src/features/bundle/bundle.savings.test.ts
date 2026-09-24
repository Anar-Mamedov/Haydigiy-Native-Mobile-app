import { BundleSummary } from '@/types/bundle.types';
import { getBundleItemSavings, resolveBundleSavings } from './bundle.savings';

function makeSummary(overrides: Partial<BundleSummary> = {}): BundleSummary {
  return {
    bundlePrice: 2000,
    isSellable: true,
    itemCount: 2,
    itemsTotal: 2500,
    maxQuantity: 10,
    savings: 500,
    savingsPercent: 20,
    ...overrides,
  };
}

describe('resolveBundleSavings', () => {
  it('exposes both the saving and the rate when the package is cheaper', () => {
    expect(resolveBundleSavings(makeSummary())).toEqual({ discountRate: 20, hasSavings: true });
  });

  it('promises nothing when the package is not cheaper', () => {
    const savings = resolveBundleSavings(makeSummary({ bundlePrice: 2500, savings: 0 }));

    expect(savings).toEqual({ discountRate: undefined, hasSavings: false });
  });

  it('hides a rate the backend reports without an actual saving', () => {
    // Tutarsız backend cevabı ekranda dayanaksız bir indirim iddiasına dönüşmemeli.
    const savings = resolveBundleSavings(makeSummary({ savings: 0, savingsPercent: 20 }));

    expect(savings).toEqual({ discountRate: undefined, hasSavings: false });
  });

  it('keeps the saving but drops the rate when the backend reports no percentage', () => {
    const savings = resolveBundleSavings(makeSummary({ savingsPercent: 0 }));

    expect(savings).toEqual({ discountRate: undefined, hasSavings: true });
  });

  it('ignores a malformed percentage instead of rendering it', () => {
    const savings = resolveBundleSavings(makeSummary({ savingsPercent: Number.NaN }));

    expect(savings).toEqual({ discountRate: undefined, hasSavings: true });
  });
});

describe('getBundleItemSavings', () => {
  it('is the gap between the single price and the package price', () => {
    expect(getBundleItemSavings({ oldPrice: 169.99, price: 149.99 })).toBeCloseTo(20, 2);
  });

  it('does not multiply by the quantity again because both prices are line totals', () => {
    // Pakette 2 adet: 2 × 169,99 ve 2 × 149,99 satır toplamları; kazanç 40 (80 değil).
    expect(getBundleItemSavings({ oldPrice: 339.98, price: 299.98 })).toBeCloseTo(40, 2);
  });

  it('is zero without a single price', () => {
    expect(getBundleItemSavings({ oldPrice: null, price: 149.99 })).toBe(0);
  });

  it('is zero when the single price is not higher', () => {
    expect(getBundleItemSavings({ oldPrice: 149.99, price: 149.99 })).toBe(0);
    expect(getBundleItemSavings({ oldPrice: 120, price: 149.99 })).toBe(0);
  });
});
