import { fireEvent, screen } from '@testing-library/react-native';
import { OrderMergePaymentScreen } from './order-merge-payment-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import type { OrderMergePaymentController } from '../hooks/use-order-merge-payment';

const mockDismissTo = jest.fn();
let mockPayment: Partial<OrderMergePaymentController> = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    orderToken: 'tok-1',
    orderNo: 'HG100254',
    amount: '250',
    installmentCount: '1',
    cargoId: '4',
    paymentMethodId: '1',
  }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, dismissTo: mockDismissTo, replace: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return {
    ...actual,
    AppScreen: ({ children }: { children: React.ReactNode }) => children,
    KeyboardAwareFormScrollView: ({ children }: { children: React.ReactNode }) => children,
    ScreenHeader: () => null,
  };
});

jest.mock('@/features/checkout/components/checkout-card-form', () => ({
  CheckoutCardForm: () => null,
}));

jest.mock('@/features/checkout/components/payment-webview', () => ({
  PaymentWebView: () => null,
}));

jest.mock('../components/order-merge-payment-summary', () => ({
  OrderMergePaymentSummary: () => null,
}));

jest.mock('../hooks/use-order-merge-payment', () => ({
  useOrderMergePayment: () => ({
    canSubmit: false,
    isSubmitting: false,
    submitError: null,
    canStartNewOrder: false,
    threeDS: null,
    submit: jest.fn(),
    closeThreeDS: jest.fn(),
    ...mockPayment,
  }),
}));

const NOT_ELIGIBLE = 'Maalesef siparişiniz hazırlanmaya başladığı için kabul edilmemektedir.';

describe('OrderMergePaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPayment = {};
  });

  it.each(['light', 'dark'] as const)(
    'offers a new order under the warehouse lock error in %s theme and returns to the cart',
    (theme) => {
      mockPayment = { submitError: NOT_ELIGIBLE, canStartNewOrder: true };
      renderWithTamagui(<OrderMergePaymentScreen />, theme);

      expect(screen.getByText(NOT_ELIGIBLE)).toBeTruthy();
      fireEvent.press(screen.getByText('Yeni Sipariş Olarak Devam Et'));

      expect(mockDismissTo).toHaveBeenCalledWith('/cart');
    },
  );

  it('does not offer a new order for other payment errors', () => {
    mockPayment = { submitError: 'Günlük ödeme limiti aşıldı.', canStartNewOrder: false };
    renderWithTamagui(<OrderMergePaymentScreen />);

    expect(screen.getByText('Günlük ödeme limiti aşıldı.')).toBeTruthy();
    expect(screen.queryByText('Yeni Sipariş Olarak Devam Et')).toBeNull();
  });
});
