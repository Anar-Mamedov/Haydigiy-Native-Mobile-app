import { screen, within } from '@testing-library/react-native';
import { ReturnConfirmSheet } from './return-confirm-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { ReturnConfirmSummary } from '../utils/return-confirm-summary';

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

const SUMMARY: ReturnConfirmSummary = {
  items: [
    {
      key: '10:1',
      name: 'Pijama Takımı',
      variantName: 'S-M',
      imageUrl: 'https://cdn/pijama.webp',
      quantity: 2,
      reasonName: 'Beden büyük geldi',
      isGift: false,
    },
    {
      key: '20:1',
      name: 'Hediye Çorap',
      variantName: '',
      imageUrl: null,
      quantity: 1,
      reasonName: 'Beden büyük geldi',
      isGift: true,
    },
  ],
  details: [
    { label: 'İade Yöntemi', value: 'Adresimden Randevulu Aldır' },
    { label: 'Kurye Randevusu', value: '7 Eki Çarşamba' },
  ],
};

const baseProps = {
  open: true,
  summary: SUMMARY,
  isConfirming: false,
  isSchedulingPickup: false,
  onConfirm: jest.fn(),
  onOpenChange: jest.fn(),
};

describe('ReturnConfirmSheet', () => {
  it('lists every returned product with its size, quantity and reason', () => {
    renderWithTamagui(<ReturnConfirmSheet {...baseProps} />);

    expect(screen.getByText('İade Talebini Onaylayın')).toBeTruthy();
    expect(screen.getByText('3 ürün için iade talebi oluşturulacak. Lütfen bilgileri kontrol edin.')).toBeTruthy();

    const pijama = within(screen.getByTestId('return-confirm-item-10:1'));
    expect(pijama.getByText('Pijama Takımı')).toBeTruthy();
    expect(pijama.getByText('Beden: S-M · 2 adet')).toBeTruthy();
    expect(pijama.getByText('Beden büyük geldi')).toBeTruthy();
    expect(pijama.queryByText('Hediye')).toBeNull();

    const gift = within(screen.getByTestId('return-confirm-item-20:1'));
    expect(gift.getByText('1 adet')).toBeTruthy();
    expect(gift.getByText('Hediye')).toBeTruthy();
  });

  it('shows the return method and pickup details', () => {
    renderWithTamagui(<ReturnConfirmSheet {...baseProps} />);

    expect(screen.getByText('Adresimden Randevulu Aldır')).toBeTruthy();
    expect(screen.getByText('Kurye Randevusu')).toBeTruthy();
    expect(screen.getByText('7 Eki Çarşamba')).toBeTruthy();
  });

  it('tells the user which step is running while confirming', () => {
    const { rerender } = renderWithTamagui(
      <ReturnConfirmSheet {...baseProps} isConfirming isSchedulingPickup />,
    );
    expect(screen.getByText('Randevu oluşturuluyor...')).toBeTruthy();

    rerender(<ReturnConfirmSheet {...baseProps} isConfirming isSchedulingPickup={false} />);
    expect(screen.getByText('Gönderiliyor...')).toBeTruthy();
  });

  it('keeps the summary readable in the dark theme', () => {
    renderWithTamagui(<ReturnConfirmSheet {...baseProps} />, 'dark');

    expect(screen.getByText('Pijama Takımı')).toBeTruthy();
    expect(screen.getByText('Onayla ve İade Et')).toBeTruthy();
    expect(screen.getByText('Vazgeç')).toBeTruthy();
  });
});
