import { fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { NewIbanModal } from './new-iban-modal';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-router', () => ({
  usePathname: () => '/return-create/1',
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'new-iban-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'new-iban-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, { testID: 'new-iban-sheet-frame', ...props }, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const mockAddPaymentMethod = jest.fn();

jest.mock('../api/return.mutations', () => ({
  useAddPaymentMethodMutation: () => ({ isPending: false, mutateAsync: mockAddPaymentMethod }),
}));

describe('NewIbanModal', () => {
  beforeEach(() => mockAddPaymentMethod.mockReset());

  it('flags a 24-digit IBAN with a wrong checksum and does not submit it', () => {
    renderWithTamagui(<NewIbanModal onClose={jest.fn()} onSuccess={jest.fn()} open />);

    fireEvent.changeText(screen.getByLabelText('IBAN *'), '1'.repeat(24));
    fireEvent.changeText(screen.getByLabelText('IBAN Sahibi Adı *'), 'Ayşe Yılmaz');

    expect(screen.getByText('IBAN formatı geçersiz')).toBeTruthy();
    fireEvent.press(screen.getByText('Kaydet'));
    expect(mockAddPaymentMethod).not.toHaveBeenCalled();
  });

  it('accepts a valid Turkish IBAN without a format error', () => {
    renderWithTamagui(<NewIbanModal onClose={jest.fn()} onSuccess={jest.fn()} open />);

    fireEvent.changeText(screen.getByLabelText('IBAN *'), 'TR33 0006 1005 1978 6457 8413 26');

    expect(screen.queryByText('IBAN formatı geçersiz')).toBeNull();
  });

  it('keeps the IBAN form keyboard-aware inside the sheet', () => {
    renderWithTamagui(<NewIbanModal onClose={jest.fn()} onSuccess={jest.fn()} open />);

    expect(screen.getByTestId('new-iban-sheet').props.moveOnKeyboardChange).toBe(true);
    expect(screen.getByTestId('new-iban-keyboard-aware-scroll').props.keyboardShouldPersistTaps).toBe('handled');
    expect(screen.getByTestId('new-iban-keyboard-aware-scroll').props.bounces).toBe(false);
    expect(screen.getByTestId('new-iban-keyboard-aware-scroll').props.overScrollMode).toBe('never');
    expect(screen.getByLabelText('IBAN *')).toBeTruthy();
    expect(screen.getByLabelText('IBAN Sahibi Adı *')).toBeTruthy();
  });

  it('renders the theme-token dimmed backdrop and anchors the sheet surface to the bottom', () => {
    renderWithTamagui(<NewIbanModal onClose={jest.fn()} onSuccess={jest.fn()} open />);

    expect(screen.getByTestId('new-iban-sheet-overlay').props.backgroundColor).toBe('$overlay');
    expect(screen.getByTestId('new-iban-sheet-frame').props.adjustPaddingForOffscreenContent).toBe(true);
    expect(screen.getByTestId('new-iban-sheet-frame').props.overflow).toBe('visible');
    expect(screen.getByTestId('new-iban-sheet-frame').props.borderBottomLeftRadius).toBe(0);
    expect(screen.getByTestId('new-iban-sheet-frame').props.borderBottomRightRadius).toBe(0);
    expect(StyleSheet.flatten(screen.getByTestId('new-iban-sheet-bottom-cover').props.style)?.height).toBe(84);
  });
});
