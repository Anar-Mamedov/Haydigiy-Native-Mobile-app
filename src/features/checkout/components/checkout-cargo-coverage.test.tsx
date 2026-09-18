import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CargoCoverageItem } from '../utils/cargo-coverage';
import { CheckoutCargoCoverage } from './checkout-cargo-coverage';

describe('CheckoutCargoCoverage', () => {
  it('renders nothing when there is no coverage answer', () => {
    renderWithTamagui(<CheckoutCargoCoverage items={[]} />);

    expect(screen.queryByTestId(/^cargo-coverage-/)).toBeNull();
  });

  // Guards against an affirmative label being drawn with the negative icon.
  it('pairs each label with the matching polarity', () => {
    const items: CargoCoverageItem[] = [
      { key: 'cityDistrict', isPositive: true, label: 'İl ve ilçe merkezlerine gider' },
      { key: 'villageRural', isPositive: false, label: 'Köylere ve kırsal bölgelere gitmez' },
    ];

    renderWithTamagui(<CheckoutCargoCoverage items={items} />);

    expect(screen.getByTestId('cargo-coverage-cityDistrict-positive')).toBeTruthy();
    expect(screen.getByTestId('cargo-coverage-villageRural-negative')).toBeTruthy();
    expect(screen.queryByTestId('cargo-coverage-cityDistrict-negative')).toBeNull();
    expect(screen.queryByTestId('cargo-coverage-villageRural-positive')).toBeNull();
    expect(screen.getByText('İl ve ilçe merkezlerine gider')).toBeTruthy();
    expect(screen.getByText('Köylere ve kırsal bölgelere gitmez')).toBeTruthy();
  });

  // Tamagui tokens must resolve in both themes; the labels must survive the switch.
  it.each(['light', 'dark'] as const)('keeps the labels readable in the %s theme', (theme) => {
    const items: CargoCoverageItem[] = [
      { key: 'cityDistrict', isPositive: true, label: 'İl ve ilçe merkezlerine gider' },
    ];

    renderWithTamagui(<CheckoutCargoCoverage items={items} />, theme);

    expect(screen.getByText('İl ve ilçe merkezlerine gider')).toBeTruthy();
    expect(screen.getByTestId('cargo-coverage-cityDistrict-positive')).toBeTruthy();
  });
});
