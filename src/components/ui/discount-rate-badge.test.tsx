import { screen } from '@testing-library/react-native';
import { DiscountRateBadge } from './discount-rate-badge';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('DiscountRateBadge', () => {
  it('renders the rate with a Turkish percent label', () => {
    renderWithTamagui(<DiscountRateBadge rate={20} testID="badge" />);

    expect(screen.getByTestId('badge')).toBeTruthy();
    expect(screen.getByText('%20')).toBeTruthy();
  });

  it('formats fractional rates with the Turkish decimal separator', () => {
    renderWithTamagui(<DiscountRateBadge rate={12.5} />);

    expect(screen.getByText('%12,5')).toBeTruthy();
  });

  it.each([
    ['zero', 0],
    ['negative', -5],
    ['not a number', Number.NaN],
  ])('promises no discount when the rate is %s', (_label, rate) => {
    // Olmayan bir indirim vaat edilmemesi kuralı rozetin kendi içinde tutulur,
    // böylece her çağıran aynı koşulu tekrar yazmak zorunda kalmaz.
    renderWithTamagui(<DiscountRateBadge rate={rate} testID="badge" />);

    expect(screen.queryByTestId('badge')).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('renders nothing when no rate is given at all', () => {
    renderWithTamagui(<DiscountRateBadge rate={undefined} testID="badge" />);

    expect(screen.queryByTestId('badge')).toBeNull();
  });

  it('announces the discount as a sentence instead of a bare number', () => {
    renderWithTamagui(<DiscountRateBadge rate={20} />);

    expect(screen.getByLabelText('yüzde 20 indirim')).toBeTruthy();
  });

  it('keeps its label readable in both themes', () => {
    // Rozet kendi zeminini taşır; metin her iki temada da beyaz kalmalı.
    const light = renderWithTamagui(<DiscountRateBadge rate={20} testID="badge" />);
    expect(light.getByText('%20')).toBeTruthy();
    light.unmount();

    renderWithTamagui(<DiscountRateBadge rate={20} testID="badge" />, 'dark');
    expect(screen.getByTestId('badge')).toBeTruthy();
    expect(screen.getByText('%20')).toBeTruthy();
  });

  it('accepts the compact size used on fixed-height surfaces', () => {
    renderWithTamagui(<DiscountRateBadge rate={20} size="sm" testID="badge" />);

    expect(screen.getByTestId('badge')).toBeTruthy();
    expect(screen.getByText('%20')).toBeTruthy();
  });
});
