import { Keyboard, StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { AppSelect } from './app-select';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'app-select-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'app-select-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, { testID: 'app-select-sheet-frame', ...props }, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

const OPTIONS = [
  { label: 'Ay', value: '01' },
  { label: 'Yil', value: '26' },
];

describe('AppSelect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('dismisses the keyboard before opening the options sheet', () => {
    renderWithTamagui(
      <AppSelect
        label="Son Kullanma Ayi"
        onValueChange={jest.fn()}
        options={OPTIONS}
        placeholder="Ay"
      />,
    );

    fireEvent.press(screen.getByLabelText('Son Kullanma Ayi'));

    expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
  });

  it('does not dismiss the keyboard when the select is disabled', () => {
    renderWithTamagui(
      <AppSelect
        disabled
        label="Son Kullanma Ayi"
        onValueChange={jest.fn()}
        options={OPTIONS}
        placeholder="Ay"
      />,
    );

    fireEvent.press(screen.getByLabelText('Son Kullanma Ayi'));

    expect(Keyboard.dismiss).not.toHaveBeenCalled();
  });

  it('keeps the last option above the system navigation bar (safe-area padding + inset in height)', () => {
    renderWithTamagui(
      <AppSelect label="İade IBAN'ı" onValueChange={jest.fn()} options={OPTIONS} placeholder="Seçiniz" />,
    );

    fireEvent.press(screen.getByLabelText('İade IBAN\'ı'));

    // Mocked safe-area bottom inset is 20 → list padding 20 + 16 = 36.
    const scroll = screen.getByTestId('app-select-options-scroll');
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)?.paddingBottom).toBe(36);

    // header 64 + 2 rows * 50 + 8 list top + 36 bottom = 208.
    expect(screen.getByTestId('app-select-sheet').props.snapPoints).toEqual([208]);
  });

  it('keeps the searchable options sheet keyboard-aware (bottom-sheet form standard)', () => {
    renderWithTamagui(
      <AppSelect label="İl" onValueChange={jest.fn()} options={OPTIONS} placeholder="Seçiniz" searchable />,
    );

    fireEvent.press(screen.getByLabelText('İl'));

    expect(screen.getByTestId('app-select-sheet').props.moveOnKeyboardChange).toBe(true);

    const scroll = screen.getByTestId('app-select-options-scroll');
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.props.bounces).toBe(false);
    expect(scroll.props.alwaysBounceVertical).toBe(false);
    expect(scroll.props.overScrollMode).toBe('never');
  });

  it('renders description rows as two fixed single lines and sizes the sheet deterministically', () => {
    const ibanOptions = [
      { description: 'TR050006400000119006679431', label: 'bekir can akdemir', value: 'iban-1' },
      { label: 'Kısa Etiket', value: 'iban-2' },
    ];

    renderWithTamagui(
      <AppSelect label="İade IBAN'ı" onValueChange={jest.fn()} options={ibanOptions} placeholder="Seçiniz" />,
    );

    fireEvent.press(screen.getByLabelText('İade IBAN\'ı'));

    // Name on the first line, IBAN on the second; both ellipsized single lines,
    // so the height never depends on the device's text wrapping.
    expect(screen.getByText('bekir can akdemir').props.numberOfLines).toBe(1);
    expect(screen.getByText('TR050006400000119006679431').props.numberOfLines).toBe(1);

    // header 64 + one 68pt two-line row + one 50pt row + 8 top + 36 bottom = 226.
    expect(screen.getByTestId('app-select-sheet').props.snapPoints).toEqual([226]);
  });

  it('shows "label - description" in the closed field for the selected option', () => {
    renderWithTamagui(
      <AppSelect
        label="İade IBAN'ı"
        onValueChange={jest.fn()}
        options={[{ description: 'TR0500064000001190066794', label: 'bekir can akdemir', value: 1 }]}
        placeholder="Seçiniz"
        value={1}
      />,
    );

    expect(screen.getByText('bekir can akdemir - TR0500064000001190066794')).toBeTruthy();
  });
});
