import { Dimensions, Keyboard, StyleSheet, TextInput } from 'react-native';
import { fireEvent, screen, within } from '@testing-library/react-native';
import { AppSelect } from './app-select';
import { getFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
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

  it('keeps the last option above the system navigation bar via the shared safe-area padding', () => {
    renderWithTamagui(
      <AppSelect label="İade IBAN'ı" onValueChange={jest.fn()} options={OPTIONS} placeholder="Seçiniz" />,
    );

    fireEvent.press(screen.getByLabelText('İade IBAN\'ı'));

    // Mocked safe-area bottom inset is 20 → the keyboard-aware wrapper pads the list by 20.
    const scroll = screen.getByTestId('app-select-keyboard-aware-scroll');
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)?.paddingBottom).toBe(20);
  });

  describe('options sheet (keyboard-aware form sheet standard)', () => {
    // Regression: the searchable sheet combined dismissOnSnapToBottom with moveOnKeyboardChange
    // and an estimated constant snap point, so keyboard show/hide could dismiss it.
    function openSearchableSelect() {
      renderWithTamagui(
        <AppSelect label="İl" onValueChange={jest.fn()} options={OPTIONS} placeholder="Seçiniz" searchable />,
      );
      fireEvent.press(screen.getByLabelText('İl'));
    }

    it('moves with the keyboard, fits its content and has no bottom snap point', () => {
      openSearchableSelect();

      const sheet = screen.getByTestId('app-select-sheet');
      expect(sheet.props.moveOnKeyboardChange).toBe(true);
      expect(sheet.props.snapPointsMode).toBe('fit');
      expect(sheet.props.snapPoints).toBeUndefined();
      expect(sheet.props.dismissOnSnapToBottom).toBeUndefined();
      expect(sheet.props.dismissOnOverlayPress).toBe(true);
    });

    it('bounds the fitted frame and covers the strip below it', () => {
      openSearchableSelect();

      const frame = screen.getByTestId('app-select-sheet-frame');
      expect(frame.props.maxHeight).toBe(getFitSheetMaxHeight(Dimensions.get('window').height, 40));
      expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
      expect(frame.props.overflow).toBe('visible');
      expect(screen.getByTestId('app-select-sheet-bottom-cover')).toBeTruthy();
    });

    it('renders the options through the keyboard-aware scroller without bounce/overscroll', () => {
      openSearchableSelect();

      const scroll = screen.getByTestId('app-select-keyboard-aware-scroll');
      expect(within(scroll).getByLabelText('Ay')).toBeTruthy();
      expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
      expect(scroll.props.bounces).toBe(false);
      expect(scroll.props.alwaysBounceVertical).toBe(false);
      expect(scroll.props.overScrollMode).toBe('never');
    });

    it('keeps the title, close control and search field pinned outside the scroller', () => {
      openSearchableSelect();

      const scroll = screen.getByTestId('app-select-keyboard-aware-scroll');
      const header = screen.getByTestId('app-select-sheet-swipe-close');
      expect(within(header).getByText('İl')).toBeTruthy();
      expect(within(header).getByLabelText('İl seçeneklerini kapat')).toBeTruthy();
      expect(within(header).getByLabelText('İl ara')).toBeTruthy();
      expect(within(scroll).queryByLabelText('İl ara')).toBeNull();
    });

    it('gives every input an accessible label', () => {
      openSearchableSelect();

      const inputs = screen.UNSAFE_getAllByType(TextInput);
      expect(inputs).toHaveLength(1);
      expect(inputs[0].props.accessibilityLabel).toBe('İl ara');
      expect(inputs[0].props.placeholder).toBe('Ara...');
    });

    it('closes through the explicit close control and resets the search', () => {
      openSearchableSelect();

      fireEvent.changeText(screen.getByLabelText('İl ara'), 'zzz');
      fireEvent.press(screen.getByLabelText('İl seçeneklerini kapat'));
      expect(screen.queryByTestId('app-select-sheet')).toBeNull();

      fireEvent.press(screen.getByLabelText('İl'));
      expect(screen.getByLabelText('İl ara').props.value).toBe('');
      expect(screen.getByLabelText('Yil')).toBeTruthy();
    });

    it('keeps the header controls and options readable in dark mode', () => {
      renderWithTamagui(
        <AppSelect label="İl" onValueChange={jest.fn()} options={OPTIONS} placeholder="Seçiniz" searchable />,
        'dark',
      );
      fireEvent.press(screen.getByLabelText('İl'));

      expect(screen.getByLabelText('İl seçeneklerini kapat')).toBeTruthy();
      expect(screen.getByLabelText('İl ara')).toBeTruthy();
      expect(screen.getByLabelText('Ay')).toBeTruthy();
      expect(screen.getByLabelText('Yil')).toBeTruthy();
    });

    it('closes when the header is swiped down', () => {
      openSearchableSelect();

      const header = screen.getByTestId('app-select-sheet-swipe-close');
      fireEvent(header, 'touchStart', { nativeEvent: { pageY: 100, timestamp: 0 } });
      fireEvent(header, 'touchEnd', { nativeEvent: { pageY: 300, timestamp: 400 } });

      expect(screen.queryByTestId('app-select-sheet')).toBeNull();
    });
  });

  describe('search', () => {
    function openSearchableSelect(onValueChange = jest.fn()) {
      renderWithTamagui(
        <AppSelect label="İl" onValueChange={onValueChange} options={OPTIONS} placeholder="Seçiniz" searchable />,
      );
      fireEvent.press(screen.getByLabelText('İl'));
    }

    it('filters the options by the query', () => {
      openSearchableSelect();

      fireEvent.changeText(screen.getByLabelText('İl ara'), 'yi');

      expect(screen.getByLabelText('Yil')).toBeTruthy();
      expect(screen.queryByLabelText('Ay')).toBeNull();
    });

    it('shows "Sonuç bulunamadı" when nothing matches', () => {
      openSearchableSelect();

      fireEvent.changeText(screen.getByLabelText('İl ara'), 'zzz');

      expect(screen.getByText('Sonuç bulunamadı')).toBeTruthy();
    });

    it('selects a filtered option and closes the sheet', () => {
      const onValueChange = jest.fn();
      openSearchableSelect(onValueChange);

      fireEvent.changeText(screen.getByLabelText('İl ara'), 'yi');
      fireEvent.press(screen.getByLabelText('Yil'));

      expect(onValueChange).toHaveBeenCalledWith('26');
      expect(screen.queryByTestId('app-select-sheet')).toBeNull();
    });

    it('keeps the list at its opening height while results shrink', () => {
      openSearchableSelect();

      const scroll = () => screen.getByTestId('app-select-keyboard-aware-scroll');
      fireEvent(scroll(), 'layout', { nativeEvent: { layout: { height: 320 } } });
      fireEvent.changeText(screen.getByLabelText('İl ara'), 'yi');
      fireEvent(scroll(), 'layout', { nativeEvent: { layout: { height: 60 } } });

      expect(StyleSheet.flatten(scroll().props.style)?.minHeight).toBe(320);
    });

    it('measures the list again on the next opening', () => {
      openSearchableSelect();

      fireEvent(screen.getByTestId('app-select-keyboard-aware-scroll'), 'layout', {
        nativeEvent: { layout: { height: 320 } },
      });
      fireEvent.press(screen.getByLabelText('İl seçeneklerini kapat'));
      fireEvent.press(screen.getByLabelText('İl'));

      const style = StyleSheet.flatten(screen.getByTestId('app-select-keyboard-aware-scroll').props.style);
      expect(style?.minHeight).toBeUndefined();
    });
  });

  it('does not offer a search field or lock the list height for a plain select', () => {
    renderWithTamagui(
      <AppSelect label="Ay" onValueChange={jest.fn()} options={OPTIONS} placeholder="Ay" />,
    );

    fireEvent.press(screen.getByLabelText('Ay'));
    const scroll = screen.getByTestId('app-select-keyboard-aware-scroll');
    fireEvent(scroll, 'layout', { nativeEvent: { layout: { height: 320 } } });

    expect(screen.UNSAFE_queryAllByType(TextInput)).toHaveLength(0);
    const style = StyleSheet.flatten(screen.getByTestId('app-select-keyboard-aware-scroll').props.style);
    expect(style?.minHeight).toBeUndefined();
  });

  it('renders description rows as two fixed single lines', () => {
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

  describe('clear (×) button', () => {
    it('empties a clearable field without opening the options sheet', () => {
      const onClear = jest.fn();
      renderWithTamagui(
        <AppSelect
          label="Cinsiyet"
          onClear={onClear}
          onValueChange={jest.fn()}
          options={OPTIONS}
          placeholder="Seçiniz"
          value="01"
        />,
      );

      fireEvent.press(screen.getByLabelText('Cinsiyet seçimini kaldır'));

      expect(onClear).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('app-select-sheet')).toBeNull();
    });

    it('takes the chevron’s place instead of sitting next to it', () => {
      // Regression: both icons showed at once and hid the value in narrow fields
      // such as the birth day. Like the web's allowClear, only one is shown.
      renderWithTamagui(
        <AppSelect
          label="Gün"
          onClear={jest.fn()}
          onValueChange={jest.fn()}
          options={OPTIONS}
          placeholder="Gün"
          value="01"
        />,
      );

      expect(screen.getByLabelText('Gün seçimini kaldır')).toBeTruthy();
      expect(screen.queryByTestId('app-select-chevron')).toBeNull();
    });

    it('shows the chevron again once the field is empty', () => {
      renderWithTamagui(
        <AppSelect
          label="Gün"
          onClear={jest.fn()}
          onValueChange={jest.fn()}
          options={OPTIONS}
          placeholder="Gün"
          value={null}
        />,
      );

      expect(screen.getByTestId('app-select-chevron')).toBeTruthy();
      expect(screen.queryByLabelText('Gün seçimini kaldır')).toBeNull();
    });

    it('keeps the value clear of the × in a narrow field', () => {
      renderWithTamagui(
        <AppSelect
          label="Gün"
          onClear={jest.fn()}
          onValueChange={jest.fn()}
          options={OPTIONS}
          placeholder="Gün"
          value="01"
        />,
      );

      expect(screen.getByLabelText('Gün')).toHaveStyle({ paddingRight: 40 });
    });

    it('is hidden while nothing is selected', () => {
      renderWithTamagui(
        <AppSelect
          label="Cinsiyet"
          onClear={jest.fn()}
          onValueChange={jest.fn()}
          options={OPTIONS}
          placeholder="Seçiniz"
          value={null}
        />,
      );

      expect(screen.queryByLabelText('Cinsiyet seçimini kaldır')).toBeNull();
    });

    it('is not offered by selects that must keep a value', () => {
      renderWithTamagui(
        <AppSelect label="Cinsiyet" onValueChange={jest.fn()} options={OPTIONS} value="01" />,
      );

      expect(screen.queryByLabelText('Cinsiyet seçimini kaldır')).toBeNull();
    });

    it('is not offered while the select is disabled', () => {
      renderWithTamagui(
        <AppSelect
          disabled
          label="Cinsiyet"
          onClear={jest.fn()}
          onValueChange={jest.fn()}
          options={OPTIONS}
          value="01"
        />,
      );

      expect(screen.queryByLabelText('Cinsiyet seçimini kaldır')).toBeNull();
    });

    it('stays reachable in dark mode', () => {
      renderWithTamagui(
        <AppSelect
          label="Cinsiyet"
          onClear={jest.fn()}
          onValueChange={jest.fn()}
          options={OPTIONS}
          value="01"
        />,
        'dark',
      );

      expect(screen.getByText('Ay')).toBeTruthy();
      expect(screen.getByLabelText('Cinsiyet seçimini kaldır')).toBeTruthy();
    });
  });

  describe('without a clear action', () => {
    it('always shows the chevron', () => {
      renderWithTamagui(
        <AppSelect label="Gün" onValueChange={jest.fn()} options={OPTIONS} value="01" />,
      );

      expect(screen.getByTestId('app-select-chevron')).toBeTruthy();
    });
  });
});
