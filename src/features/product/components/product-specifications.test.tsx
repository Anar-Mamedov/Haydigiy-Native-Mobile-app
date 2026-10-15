import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { BRAND_TINT_TEXT_COLOR, BRAND_TINT_TEXT_COLOR_DARK } from '@/lib/theme/colors';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductSpecifications } from './product-specifications';

const properties = [
  { name: 'Kumaş', value: 'Keten' },
  { name: 'Kalıp', value: 'Rahat' },
  { name: 'Yaka', value: 'V Yaka' },
];

describe('ProductSpecifications', () => {
  it('expands the list from a 48dp "Devamını Gör" action that announces its state', () => {
    renderWithTamagui(<ProductSpecifications properties={properties} />);

    const toggle = screen.getByLabelText('Devamını Gör');
    expect(StyleSheet.flatten(toggle.props.style)).toMatchObject({ minHeight: 48 });
    expect(toggle.props.accessibilityState).toMatchObject({ expanded: false });
    expect(screen.queryByText('V Yaka')).toBeNull();

    fireEvent.press(toggle);

    expect(screen.getByText('V Yaka')).toBeTruthy();
    expect(screen.getByLabelText('Daha Az Göster').props.accessibilityState).toMatchObject({ expanded: true });
  });

  it('shows the "Tüm özellikleri göster" button as a button', () => {
    renderWithTamagui(<ProductSpecifications properties={properties} />);

    const button = screen.getByRole('button', { name: /Tüm özellikleri göster/ });
    fireEvent.press(button);
    expect(screen.getByText('V Yaka')).toBeTruthy();
  });

  it.each([
    ['light', BRAND_TINT_TEXT_COLOR],
    ['dark', BRAND_TINT_TEXT_COLOR_DARK],
  ] as const)('writes feature names in the readable tint color (%s)', (theme, expectedColor) => {
    // Regresyon: #ea580c açık turuncu zeminde 3.35:1 kalıyordu.
    renderWithTamagui(<ProductSpecifications properties={properties} />, theme);

    expect(StyleSheet.flatten(screen.getByText('Kumaş').props.style)).toMatchObject({ color: expectedColor });
  });
});
