import { screen } from '@testing-library/react-native';
import { OrderReviewSheet } from './order-review-sheet';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ReviewTarget } from '@/types/review.types';

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
});
