import { Dimensions, Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { ConfirmSheet } from '@/components/ui/confirm-sheet';
import { getFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'sheet-root', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

describe('ConfirmSheet', () => {
  const baseProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    title: 'İadeyi Onaylayın',
    description: '2 ürün iade edilecek.',
    confirmLabel: 'Onayla ve İade Et',
    cancelLabel: 'Vazgeç',
    confirmingLabel: 'Gönderiliyor...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title, description, summary and both actions when open', () => {
    renderWithTamagui(
      <ConfirmSheet {...baseProps}>
        <Text>Özet satırı</Text>
      </ConfirmSheet>,
    );

    expect(screen.getByText('İadeyi Onaylayın')).toBeTruthy();
    expect(screen.getByText('2 ürün iade edilecek.')).toBeTruthy();
    expect(screen.getByText('Özet satırı')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Onayla ve İade Et' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Vazgeç' })).toBeTruthy();
  });

  it('renders nothing while closed', () => {
    renderWithTamagui(<ConfirmSheet {...baseProps} open={false} />);

    expect(screen.queryByText('İadeyi Onaylayın')).toBeNull();
  });

  it('confirms with the primary action and closes with the cancel action', () => {
    renderWithTamagui(<ConfirmSheet {...baseProps} />);

    fireEvent.press(screen.getByRole('button', { name: 'Onayla ve İade Et' }));
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole('button', { name: 'Vazgeç' }));
    expect(baseProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  // İstek sürerken sheet kapatılamaz; aksi halde sonuç sahipsiz kalır.
  it('locks both actions and ignores dismissal while confirming', () => {
    renderWithTamagui(<ConfirmSheet {...baseProps} isConfirming />);

    expect(screen.getByText('Gönderiliyor...')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Gönderiliyor...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Vazgeç' })).toBeDisabled();

    const root = screen.getByTestId('sheet-root');
    expect(root.props.dismissOnOverlayPress).toBe(false);
    root.props.onOpenChange(false);
    expect(baseProps.onOpenChange).not.toHaveBeenCalled();
  });

  it('uses the fitted, bounded sheet shape with a bottom cover and no overscroll', () => {
    renderWithTamagui(<ConfirmSheet {...baseProps} testID="return-confirm" />);

    expect(screen.getByTestId('sheet-root').props.snapPointsMode).toBe('fit');
    const frame = screen.getByTestId('return-confirm-frame');
    expect(frame.props.maxHeight).toBe(getFitSheetMaxHeight(Dimensions.get('window').height, 40));
    expect(frame.props.overflow).toBe('visible');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(screen.getByTestId('return-confirm-bottom-cover')).toBeTruthy();

    const scroll = screen.getByTestId('return-confirm-scroll');
    expect(scroll.props.bounces).toBe(false);
    expect(scroll.props.alwaysBounceVertical).toBe(false);
    expect(scroll.props.overScrollMode).toBe('never');
  });

  // Yüzde maxHeight fit modunda yok sayılıyordu; uzun iade özetinde sheet tam ekrana uzuyor,
  // başlık durum çubuğunun, onay butonu Android gezinme çubuğunun altında kalıyordu.
  it('bounds the frame with an absolute height that clears the status bar', () => {
    renderWithTamagui(<ConfirmSheet {...baseProps} testID="return-confirm" />);

    const { maxHeight } = screen.getByTestId('return-confirm-frame').props;
    expect(typeof maxHeight).toBe('number');
    expect(maxHeight).toBeLessThanOrEqual(Dimensions.get('window').height - 40);
  });

  it('keeps every label readable in the dark theme', () => {
    renderWithTamagui(<ConfirmSheet {...baseProps} />, 'dark');

    expect(screen.getByText('İadeyi Onaylayın')).toBeTruthy();
    expect(screen.getByText('Onayla ve İade Et')).toBeTruthy();
    expect(screen.getByText('Vazgeç')).toBeTruthy();
  });
});
