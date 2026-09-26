import { fireEvent, screen, within } from '@testing-library/react-native';
import { CheckoutScreen } from './checkout-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const AGREEMENT_LABEL = 'Ön bilgilendirme koşullarını ve mesafeli satış sözleşmesini onaylıyorum';
const SECTION_ORDER_PATTERN =
  /^checkout-(delivery-address|campaign-card|coupon-section|cart-items|cargo-section|shipping-estimate|payment-options|card-form|installments|agreement-consent|contract-preview)$/;
// Web (f72970150) ile aynı sıra: adres, kampanya ve kupon en üstte; sepet ve kargo onların altında.
const TOP_SECTIONS = [
  'checkout-delivery-address',
  'checkout-campaign-card',
  'checkout-coupon-section',
  'checkout-cart-items',
  'checkout-cargo-section',
  'checkout-shipping-estimate',
];

const mockSetIsAgreementChecked = jest.fn();

/** Ekran yerleşimi test edilirken ağır bölümlerin yerine geçen işaretli boş görünüm. */
function mockSection(testID: string) {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  return function MockSection() {
    return React.createElement(View, { testID });
  };
}

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { Text, View } = jest.requireActual('react-native');

  return {
    AppScreen: ({ children, header }: any) => React.createElement(View, null, header, children),
    EmptyState: ({ title }: any) => React.createElement(Text, null, title),
    ScreenHeader: ({ title }: any) => React.createElement(Text, null, title),
  };
});

jest.mock('@/features/analytics/hooks/use-analytics-commerce-tracking', () => ({
  useTrackAnalyticsCheckoutStarted: jest.fn(),
}));

jest.mock('@/features/shipping/components/shipping-estimate-info', () => ({
  ShippingEstimateInfo: mockSection('checkout-shipping-estimate'),
}));

jest.mock('@/features/cart/components/standard-campaign-card', () => ({
  StandardCampaignCard: mockSection('checkout-campaign-card'),
}));

jest.mock('../components/checkout-cart-items', () => ({
  CheckoutCartItems: mockSection('checkout-cart-items'),
}));
jest.mock('../components/checkout-cargo-section', () => ({
  CheckoutCargoSection: mockSection('checkout-cargo-section'),
}));
jest.mock('../components/checkout-delivery-address', () => ({
  CheckoutDeliveryAddress: mockSection('checkout-delivery-address'),
}));
jest.mock('../components/checkout-coupon-section', () => ({
  CheckoutCouponSection: mockSection('checkout-coupon-section'),
}));
jest.mock('../components/checkout-payment-options', () => ({
  CheckoutPaymentOptions: mockSection('checkout-payment-options'),
}));
jest.mock('../components/checkout-card-form', () => ({
  CheckoutCardForm: mockSection('checkout-card-form'),
}));
jest.mock('../components/checkout-installments', () => ({
  CheckoutInstallments: mockSection('checkout-installments'),
}));
jest.mock('../components/checkout-contracts', () => ({
  ...jest.requireActual('../components/checkout-contracts'),
  CheckoutContractSheet: () => null,
  ContractPreviewContent: mockSection('checkout-contract-preview'),
}));
jest.mock('../components/checkout-summary-backdrop', () => ({
  CheckoutSummaryBackdrop: () => null,
}));
jest.mock('../components/checkout-updating-overlay', () => ({
  CheckoutUpdatingOverlay: () => null,
}));
jest.mock('../components/checkout-price-change-dialog', () => ({
  CheckoutPriceChangeDialog: () => null,
}));
jest.mock('../components/payment-webview', () => ({ PaymentWebView: () => null }));

let mockController: Record<string, unknown>;

jest.mock('../hooks/use-checkout-controller', () => ({
  useCheckoutController: () => mockController,
}));

jest.mock('../hooks/use-place-order', () => ({
  usePlaceOrder: () => ({
    cancelPriceChange: jest.fn(),
    closeThreeDS: jest.fn(),
    confirmPriceChange: jest.fn(),
    isSubmitting: false,
    priceChangeConfirmation: null,
    submit: jest.fn(),
    threeDS: null,
  }),
}));

function makeController(overrides: Record<string, unknown> = {}) {
  return {
    canSubmit: false,
    card: {
      installmentPlans: [],
      isLoadingInstallments: false,
      selectInstallment: jest.fn(),
      selectedInstallment: 1,
    },
    goBack: jest.fn(),
    hint: null,
    isAgreementChecked: false,
    isCardPayment: true,
    isCheckoutLocked: false,
    isError: false,
    isLoading: false,
    isOrderSummaryLoading: false,
    isSummaryExpanded: false,
    items: [{ quantity: 1, title: 'Elbise', unitPrice: 100 }],
    orderSummary: null,
    orderSummaryError: null,
    refetchAddresses: jest.fn(),
    refetchCart: jest.fn(),
    selectedMethod: null,
    sendInvoiceToSameAddress: true,
    setIsAgreementChecked: mockSetIsAgreementChecked,
    setSubmitError: jest.fn(),
    singlePaymentTotal: 100,
    submitError: null,
    toggleSummary: jest.fn(),
    ...overrides,
  };
}

function renderedSectionOrder() {
  return within(screen.getByTestId('checkout-scroll'))
    .getAllByTestId(SECTION_ORDER_PATTERN)
    .map((node) => node.props.testID);
}

describe('CheckoutScreen', () => {
  beforeEach(() => {
    mockSetIsAgreementChecked.mockClear();
    mockController = makeController();
  });

  // Onay kartı sabit özet çubuğunda ekranın büyük kısmını kaplıyordu; artık
  // kaydırılabilir içerikte, ödeme seçeneklerinin hemen altında durmalı.
  it('renders the sections in the web order with the agreement below the card payment options', () => {
    renderWithTamagui(<CheckoutScreen />);

    expect(renderedSectionOrder()).toEqual([
      ...TOP_SECTIONS,
      'checkout-payment-options',
      'checkout-card-form',
      'checkout-installments',
      'checkout-agreement-consent',
      'checkout-contract-preview',
    ]);
    expect(
      within(screen.getByTestId('checkout-summary-bar')).queryByLabelText(AGREEMENT_LABEL),
    ).toBeNull();
  });

  it('keeps the agreement consent right below the payment methods without a card payment', () => {
    mockController = makeController({ isCardPayment: false });

    renderWithTamagui(<CheckoutScreen />);

    expect(renderedSectionOrder()).toEqual([
      ...TOP_SECTIONS,
      'checkout-payment-options',
      'checkout-agreement-consent',
      'checkout-contract-preview',
    ]);
  });

  it('toggles the agreement from the scrollable consent card', () => {
    renderWithTamagui(<CheckoutScreen />);

    fireEvent.press(
      within(screen.getByTestId('checkout-scroll')).getByLabelText(AGREEMENT_LABEL),
    );

    expect(mockSetIsAgreementChecked).toHaveBeenCalledWith(true);
  });
});
