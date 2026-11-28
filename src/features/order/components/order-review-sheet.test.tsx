import { fireEvent, screen } from '@testing-library/react-native';
import { OrderReviewSheet } from './order-review-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReviewTarget } from '@/types/review.types';
import { KVKK_DISCLOSURE_NOTICE } from '@/features/agreements/data/kvkk-disclosure-notice';

jest.mock('expo-router', () => ({
  usePathname: () => '/orders',
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'order-review-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'order-review-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, { testID: 'order-review-sheet-frame', ...props }, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

jest.mock('../api/review.mutations', () => ({
  useSubmitReviewMutation: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

const item: ReviewTarget = {
  id: 1,
  image: null,
  name: 'Test Ürün',
  quantity: 1,
  slug: 'test-urun',
  variantName: 'M',
};

describe('OrderReviewSheet', () => {
  it('keeps the review form keyboard-aware inside the sheet', () => {
    renderWithTamagui(<OrderReviewSheet item={item} onOpenChange={jest.fn()} open orderId="order-1" />);

    expect(screen.getByTestId('order-review-sheet').props.moveOnKeyboardChange).toBe(true);

    const scroller = screen.getByTestId('order-review-keyboard-aware-scroll');
    expect(scroller.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.alwaysBounceVertical).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
    expect(screen.getByPlaceholderText('Ürün hakkındaki düşüncelerinizi paylaşın.')).toBeTruthy();
  });

  it('opens the shared Aydınlatma Metni inside the sheet and keeps the entered review', () => {
    renderWithTamagui(<OrderReviewSheet item={item} onOpenChange={jest.fn()} open orderId="order-1" />);

    const placeholder = 'Ürün hakkındaki düşüncelerinizi paylaşın.';
    fireEvent.changeText(screen.getByPlaceholderText(placeholder), 'Kalıbı tam oldu');

    fireEvent.press(screen.getByRole('link', { name: 'Aydınlatma Metni' }));

    // Kayıt ve giriş ekranlarıyla aynı metin: KVKK_DISCLOSURE_NOTICE
    expect(screen.getByTestId('order-review-disclosure')).toBeTruthy();
    const firstBlock = KVKK_DISCLOSURE_NOTICE[0];
    expect(firstBlock.type).toBe('heading');
    expect(screen.getByText((firstBlock as { text: string }).text)).toBeTruthy();
    expect(screen.queryByPlaceholderText(placeholder)).toBeNull();

    fireEvent.press(screen.getByText('Geri'));

    expect(screen.queryByTestId('order-review-disclosure')).toBeNull();
    expect(screen.getByPlaceholderText(placeholder).props.value).toBe('Kalıbı tam oldu');
  });
});
