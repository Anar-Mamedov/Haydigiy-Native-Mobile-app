import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { NotifyStockDialog } from './notify-stock-dialog';

const ERROR_MESSAGE = 'Bildirim talebiniz gönderilemedi. Lütfen daha sonra tekrar deneyin.';

describe('NotifyStockDialog', () => {
  it('confirms the request when no error is passed', () => {
    renderWithTamagui(<NotifyStockDialog onOpenChange={jest.fn()} open />);

    expect(screen.getByText('TALEBİNİ ALDIK')).toBeTruthy();
    expect(screen.getByText(/e-posta adresinize bilgilendirme/)).toBeTruthy();
  });

  // AGENTS.md: stok bildirimi isteği sessizce başarısız olmamalı.
  it('reports the failure instead of the confirmation when an error is passed', () => {
    renderWithTamagui(<NotifyStockDialog errorMessage={ERROR_MESSAGE} onOpenChange={jest.fn()} open />);

    expect(screen.getByText('TALEBİNİ ALAMADIK')).toBeTruthy();
    expect(screen.getByText(ERROR_MESSAGE)).toBeTruthy();
    expect(screen.queryByText('TALEBİNİ ALDIK')).toBeNull();
  });

  it('closes from the confirm button', () => {
    const onOpenChange = jest.fn();
    renderWithTamagui(<NotifyStockDialog onOpenChange={onOpenChange} open />);

    fireEvent.press(screen.getByTestId('notify-stock-dialog-confirm'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps both states readable in dark theme', () => {
    renderWithTamagui(<NotifyStockDialog onOpenChange={jest.fn()} open />, 'dark');
    expect(screen.getByText('TALEBİNİ ALDIK')).toBeTruthy();
    expect(screen.getByTestId('notify-stock-dialog-confirm')).toBeTruthy();

    renderWithTamagui(
      <NotifyStockDialog errorMessage={ERROR_MESSAGE} onOpenChange={jest.fn()} open />,
      'dark',
    );
    expect(screen.getByText('TALEBİNİ ALAMADIK')).toBeTruthy();
    expect(screen.getByText(ERROR_MESSAGE)).toBeTruthy();
  });
});
