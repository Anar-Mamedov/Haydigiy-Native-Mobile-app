import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { Paragraph } from './app-paragraph';
import { InlineTextLink } from './inline-text-link';

describe('InlineTextLink', () => {
  it.each(['light', 'dark'] as const)('renders as an underlined link inside a paragraph in the %s theme', (theme) => {
    renderWithTamagui(
      <Paragraph>
        Kişisel verileriniz{' '}
        <InlineTextLink onPress={jest.fn()}>Aydınlatma Metni</InlineTextLink> kapsamında işlenir.
      </Paragraph>,
      theme,
    );

    const link = screen.getByRole('link', { name: 'Aydınlatma Metni' });
    expect(link).toBeTruthy();
    expect(link).toHaveStyle({ textDecorationLine: 'underline' });
  });

  it('inherits the font size of the surrounding paragraph instead of setting its own', () => {
    renderWithTamagui(
      <Paragraph size="$2">
        Giriş yaparak <InlineTextLink onPress={jest.fn()}>Üyelik Sözleşmesi</InlineTextLink>
      </Paragraph>,
    );

    const link = screen.getByRole('link', { name: 'Üyelik Sözleşmesi' });
    expect(link).not.toHaveStyle({ fontSize: expect.anything() });
    expect(link).not.toHaveStyle({ lineHeight: expect.anything() });
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderWithTamagui(
      <Paragraph>
        <InlineTextLink onPress={onPress}>Gizlilik Politikası</InlineTextLink>
      </Paragraph>,
    );

    fireEvent.press(screen.getByRole('link', { name: 'Gizlilik Politikası' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
