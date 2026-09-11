import { View } from 'react-native';
import { screen, within } from '@testing-library/react-native';
import { CountBadge, IconWithCountBadge } from './count-badge';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('CountBadge', () => {
  it('renders the count', () => {
    renderWithTamagui(<CountBadge count={3} testID="badge" />);

    expect(screen.getByTestId('badge')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('caps the count at the max threshold', () => {
    renderWithTamagui(<CountBadge count={12} testID="badge" />);

    expect(screen.getByText('9+')).toBeTruthy();
  });

  it('honours a custom max threshold', () => {
    renderWithTamagui(<CountBadge count={120} max={99} testID="badge" />);

    expect(screen.getByText('99+')).toBeTruthy();
  });

  it.each([
    ['zero', 0],
    ['negative', -2],
    ['not a number', Number.NaN],
    ['undefined', undefined],
  ])('draws nothing when the count is %s', (_label, count) => {
    // Boş sayaçta çizilmeme kuralı rozetin içinde tutulur; çağıranlar aynı
    // koşulu tekrar yazmak zorunda kalmaz.
    renderWithTamagui(<CountBadge count={count} testID="badge" />);

    expect(screen.queryByTestId('badge')).toBeNull();
  });

  it('keeps its label readable in both themes', () => {
    // Rozet kendi zeminini taşır; metin her iki temada da beyaz kalmalı.
    const light = renderWithTamagui(<CountBadge count={3} testID="badge" />);
    expect(light.getByText('3')).toBeTruthy();
    light.unmount();

    renderWithTamagui(<CountBadge count={3} testID="badge" />, 'dark');
    expect(screen.getByTestId('badge')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });
});

describe('IconWithCountBadge', () => {
  it('anchors the badge to the icon box', () => {
    // Asıl hata buydu: rozet ikon + etiket kolonuna çapalandığında etiketin
    // hizasına kayıyordu. Çapa yalnızca ikonu saran kutu olmalı.
    renderWithTamagui(
      <IconWithCountBadge
        badgeTestID="badge"
        count={3}
        icon={<View testID="icon" />}
        testID="anchor"
      />,
    );

    const anchor = within(screen.getByTestId('anchor'));

    expect(anchor.getByTestId('icon')).toBeTruthy();
    expect(anchor.getByTestId('badge')).toBeTruthy();
  });

  it('renders the icon alone when there is nothing to count', () => {
    renderWithTamagui(
      <IconWithCountBadge
        badgeTestID="badge"
        count={0}
        icon={<View testID="icon" />}
        testID="anchor"
      />,
    );

    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.queryByTestId('badge')).toBeNull();
  });
});
