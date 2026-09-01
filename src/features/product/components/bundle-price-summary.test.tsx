import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BundlePriceSummary } from './bundle-price-summary';
import { BundleSummary } from '@/types/bundle.types';

function makeSummary(overrides: Partial<BundleSummary> = {}): BundleSummary {
  return {
    itemCount: 2,
    itemsTotal: 2500,
    bundlePrice: 2000,
    savings: 500,
    savingsPercent: 20,
    isSellable: true,
    maxQuantity: 10,
    ...overrides,
  };
}

function renderSummary(overrides: Partial<BundleSummary> = {}, theme?: 'light' | 'dark') {
  return renderWithTamagui(<BundlePriceSummary summary={makeSummary(overrides)} />, theme);
}

describe('BundlePriceSummary', () => {
  it('shows the package price', () => {
    renderSummary();

    expect(screen.getByText('Paket Fiyatı')).toBeTruthy();
    expect(screen.getByText('₺2.000,00')).toBeTruthy();
  });

  it('strikes through the separate-purchase total when the package is cheaper', () => {
    renderSummary();

    expect(screen.getByText('₺2.500,00')).toBeTruthy();
    expect(screen.getByText('Pakette kazanç:')).toBeTruthy();
    expect(screen.getByText('₺500,00')).toBeTruthy();
    expect(screen.getByTestId('bundle-summary-discount-badge')).toBeTruthy();
    expect(screen.getByText('%20')).toBeTruthy();
  });

  it('promises no discount when the package is not cheaper', () => {
    // Kullanıcıya olmayan bir indirim vaat edilmez.
    renderSummary({ savings: 0, savingsPercent: 0, bundlePrice: 2500 });

    expect(screen.queryByText('Pakette kazanç:')).toBeNull();
    expect(screen.queryByTestId('bundle-summary-discount-badge')).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.getByText('₺2.500,00')).toBeTruthy();
  });

  it('omits the percentage when the backend reports none', () => {
    renderSummary({ savings: 500, savingsPercent: 0 });

    expect(screen.getByText('Pakette kazanç:')).toBeTruthy();
    expect(screen.getByText('₺500,00')).toBeTruthy();
    expect(screen.queryByTestId('bundle-summary-discount-badge')).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('stays readable in the dark theme', () => {
    renderSummary({}, 'dark');

    expect(screen.getByText('Paket Fiyatı')).toBeTruthy();
    expect(screen.getByText('Pakette kazanç:')).toBeTruthy();
    expect(screen.getByText('₺2.000,00')).toBeTruthy();
  });
});
