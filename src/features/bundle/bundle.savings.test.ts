import { BundleSummary } from '@/types/bundle.types';
import { resolveBundleSavings } from './bundle.savings';

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
