import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { ReturnResultSheets } from './return-result-sheets';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, props, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, props);
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

describe('ReturnResultSheets', () => {
  it('expands the success sheet to the available screen height and keeps its action above the safe area', () => {
    renderWithTamagui(
      <ReturnResultSheets
        canRetry
        errorMessage={null}
        isRecreating={false}
        isStorePickup={false}
        onCloseError={jest.fn()}
        onCloseSuccess={jest.fn()}
        onRecreatePtt={jest.fn()}
        onRetry={jest.fn()}
        returnMethod="hepsijet"
        successMessage="Randevunuz oluşturuldu!"
      />,
    );

    const scroll = screen.getByTestId('return-success-sheet-scroll');

    // Mocked safe-area frame 812 - top inset 40 - 24 pt top clearance.
    expect(StyleSheet.flatten(scroll.props.style)?.maxHeight).toBe(748);
    // Mocked bottom inset 20 keeps the action clear of the system navigation area.
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)?.paddingBottom).toBe(20);
    expect(screen.getByLabelText('Siparişlerime dön')).toBeTruthy();
  });

  it('shows PTT branch info without the old "free return" wording after a PTT flow', () => {
    renderWithTamagui(
      <ReturnResultSheets
        {...makeProps({ successMessage: 'İade talebiniz başarıyla PTT kargo ile güncellendi.' })}
      />,
    );

    expect(screen.getByText('PTT Kargo ile gönderilecek')).toBeTruthy();
    expect(screen.getByText('PTT Kargo şubelerinden iadenizi gönderebilirsiniz.')).toBeTruthy();
    expect(screen.queryByText('Hepsijet ile evden alım')).toBeNull();
    expect(screen.queryByText(/ücretsiz/i)).toBeNull();
  });

  describe('error sheet', () => {
    it('offers "Yeniden dene" next to "Kapat" for a generic error (web parity)', () => {
      const onRetry = jest.fn();
      const onCloseError = jest.fn();
      renderWithTamagui(
        <ReturnResultSheets
          {...makeProps({ errorMessage: 'Sunucu hatası', onRetry, onCloseError })}
        />,
      );

      fireEvent.press(screen.getByLabelText('Yeniden dene'));
      expect(onRetry).toHaveBeenCalledTimes(1);

      fireEvent.press(screen.getByLabelText('Kapat'));
      expect(onCloseError).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('PTT İade Talebi Oluştur')).toBeNull();
    });

    it('disables the retry while the form can no longer be submitted', () => {
      const onRetry = jest.fn();
      renderWithTamagui(
        <ReturnResultSheets
          {...makeProps({ canRetry: false, errorMessage: 'Sunucu hatası', onRetry })}
        />,
      );

      const retry = screen.getByLabelText('Yeniden dene');
      expect(retry).toBeDisabled();
      fireEvent.press(retry);
      expect(onRetry).not.toHaveBeenCalled();
    });

    it('swaps the retry for the PTT fallback on the Hepsijet "sistemde kayıtlı" error', () => {
      const onRecreatePtt = jest.fn();
      renderWithTamagui(
        <ReturnResultSheets
          {...makeProps({
            errorMessage: 'HepsiJet: bu gönderi sistemde kayıtlı.',
            onRecreatePtt,
          })}
        />,
      );

      expect(screen.queryByLabelText('Yeniden dene')).toBeNull();
      fireEvent.press(screen.getByText('PTT İade Talebi Oluştur'));
      expect(onRecreatePtt).toHaveBeenCalledTimes(1);
    });

    it('keeps the actions readable in dark mode', () => {
      renderWithTamagui(
        <ReturnResultSheets {...makeProps({ errorMessage: 'Sunucu hatası' })} />,
        'dark',
      );

      expect(screen.getByText('Yeniden dene')).toBeTruthy();
      expect(screen.getByText('Kapat')).toBeTruthy();
    });
  });
});

function makeProps(
  overrides: Partial<Parameters<typeof ReturnResultSheets>[0]> = {},
): Parameters<typeof ReturnResultSheets>[0] {
  return {
    canRetry: true,
    errorMessage: null,
    isRecreating: false,
    isStorePickup: false,
    onCloseError: jest.fn(),
    onCloseSuccess: jest.fn(),
    onRecreatePtt: jest.fn(),
    onRetry: jest.fn(),
    returnMethod: 'ptt',
    successMessage: null,
    ...overrides,
  };
}
