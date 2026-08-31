import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SizeCalculatorModal } from './size-calculator-modal';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { calculateSize } from '@/services/product.service';

jest.mock('@/services/product.service', () => ({
  calculateSize: jest.fn(),
  submitProductFeedback: jest.fn(),
}));

jest.mock('tamagui', () => {
  const actual = jest.requireActual('tamagui');
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'size-calculator-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay() {
    return null;
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...actual, Sheet: SheetRoot };
});

const mockCalculateSize = calculateSize as jest.MockedFunction<typeof calculateSize>;

describe('SizeCalculatorModal', () => {
  beforeEach(() => {
    mockCalculateSize.mockReset();
  });

  // Regression: the sheet used to stay put when the keyboard opened, so the boy/kilo
  // inputs ended up hidden behind the native keyboard.
  it('keeps the boy/kilo form above the keyboard inside the sheet', () => {
    renderWithTamagui(<SizeCalculatorModal onOpenChange={jest.fn()} open />);

    expect(screen.getByTestId('size-calculator-sheet').props.moveOnKeyboardChange).toBe(true);
    expect(screen.getByTestId('size-calculator-sheet').props.snapPointsMode).toBe('fit');

    const scroller = screen.getByTestId('size-calculator-keyboard-aware-scroll');
    expect(scroller.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.alwaysBounceVertical).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
  });

  it('covers the area below the sheet so the tab bar gap follows the theme', () => {
    renderWithTamagui(<SizeCalculatorModal onOpenChange={jest.fn()} open />);

    const frame = screen.getByTestId('size-calculator-sheet-frame');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(frame.props.overflow).toBe('visible');
    expect(
      StyleSheet.flatten(screen.getByTestId('size-calculator-sheet-bottom-cover').props.style)?.height,
    ).toBe(84);
  });

  it('labels both measurement inputs for screen readers', () => {
    renderWithTamagui(<SizeCalculatorModal onOpenChange={jest.fn()} open />);

    expect(screen.getByLabelText('Boy (cm)')).toBeTruthy();
    expect(screen.getByLabelText('Kilo (kg)')).toBeTruthy();
  });

  it('shows the recommended size and keeps the sheet open after calculating', async () => {
    mockCalculateSize.mockResolvedValue({
      status: 'success',
      data: { recommended_size: '8-9 yaş' },
    });
    const onOpenChange = jest.fn();

    renderWithTamagui(
      <SizeCalculatorModal open onOpenChange={onOpenChange} onCalculateComplete={jest.fn()} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Örn: 172'), '124');
    fireEvent.changeText(screen.getByPlaceholderText('Örn: 59'), '67');
    fireEvent.press(screen.getByText('Hesapla'));

    // Result is rendered…
    await waitFor(() => expect(screen.getByText('8-9 yaş')).toBeTruthy());
    expect(screen.getByText('Sizin İçin Önerilen Beden:')).toBeTruthy();

    // …and the modal does NOT close itself (regression: it used to be dismissed).
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('forwards the recommended size to onCalculateComplete', async () => {
    mockCalculateSize.mockResolvedValue({
      status: 'success',
      data: { recommended_size: 'L' },
    });
    const onCalculateComplete = jest.fn();

    renderWithTamagui(
      <SizeCalculatorModal open onOpenChange={jest.fn()} onCalculateComplete={onCalculateComplete} />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Örn: 172'), '172');
    fireEvent.changeText(screen.getByPlaceholderText('Örn: 59'), '70');
    fireEvent.press(screen.getByText('Hesapla'));

    await waitFor(() => expect(onCalculateComplete).toHaveBeenCalledWith('L'));
  });

  it('validates input before calling the API', () => {
    const onCalculateComplete = jest.fn();

    renderWithTamagui(
      <SizeCalculatorModal open onOpenChange={jest.fn()} onCalculateComplete={onCalculateComplete} />,
    );

    // Press without entering height/weight.
    fireEvent.press(screen.getByText('Hesapla'));

    expect(mockCalculateSize).not.toHaveBeenCalled();
    expect(
      screen.getByText('Lütfen geçerli boy (50–250 cm) ve kilo (10–200 kg) girin.'),
    ).toBeTruthy();
  });
});
