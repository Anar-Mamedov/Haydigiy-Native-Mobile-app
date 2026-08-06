import { screen, fireEvent } from '@testing-library/react-native';
import { Theme } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppCheckbox } from './app-checkbox';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('AppCheckbox', () => {
  it('toggles its value when pressed', () => {
    const onChange = jest.fn();
    renderWithTamagui(
      <AppCheckbox accessibilityLabel="KVKK Onayı" checked={false} onChange={onChange}>
        <Paragraph>KVKK metnini okudum</Paragraph>
      </AppCheckbox>
    );

    fireEvent.press(screen.getByLabelText('KVKK Onayı'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reports the checked state via accessibility for screen readers', () => {
    renderWithTamagui(
      <AppCheckbox accessibilityLabel="Onay" checked onChange={jest.fn()} />
    );

    const checkbox = screen.getByLabelText('Onay');
    expect(checkbox.props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
  });

  it('keeps its label content readable in dark theme', () => {
    renderWithTamagui(
      <Theme name="dark">
        <AppCheckbox accessibilityLabel="Onay" checked onChange={jest.fn()}>
          <Paragraph>Ticari ileti onayı</Paragraph>
        </AppCheckbox>
      </Theme>
    );

    expect(screen.getByText('Ticari ileti onayı')).toBeTruthy();
    expect(screen.getByLabelText('Onay')).toBeTruthy();
  });
});
