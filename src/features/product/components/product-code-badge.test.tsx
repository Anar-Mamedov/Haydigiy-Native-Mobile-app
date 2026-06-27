import { screen } from '@testing-library/react-native';
import { ProductCodeBadge } from './product-code-badge';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('ProductCodeBadge', () => {
  it('renders the product code', () => {
    renderWithTamagui(<ProductCodeBadge code="42112.1247." top={66} />);

    expect(screen.getByText('42112.1247.')).toBeTruthy();
  });

  it('exposes an accessible label describing the code', () => {
    renderWithTamagui(<ProductCodeBadge code="42112.1247." top={66} />);

    expect(screen.getByLabelText('Ürün kodu: 42112.1247.')).toBeTruthy();
  });
});
