import { fireEvent, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ReturnCreateScreen } from './return-create-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockSetNote = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'order-1' }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: mockPush, replace: jest.fn() }),
}));

jest.mock('@/features/auth/hooks/use-auth-status', () => ({
  useAuthStatus: () => ({ isAuthenticated: true, isLoading: false }),
}));

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View, Text, TextInput } = jest.requireActual('react-native');

  return {
    AppInput: ({ label, ...props }: any) =>
      React.createElement(TextInput, { accessibilityLabel: label, ...props }),
    AppScreen: ({ children }: any) => React.createElement(View, null, children),
    AppSelect: ({ label, ...props }: any) =>
      React.createElement(View, { accessibilityLabel: label, ...props }),
    EmptyState: ({ title }: any) => React.createElement(Text, null, title),
    KeyboardAwareFormScrollView: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    SectionCard: ({ children }: any) => React.createElement(View, null, children),
    SelectableCard: ({ title, onPress, selected }: any) =>
      React.createElement(Text, { accessibilityLabel: title, accessibilityState: { selected }, onPress }, title),
  };
});

jest.mock('../components/new-iban-modal', () => ({
  NewIbanModal: () => null,
}));

const mockResultSheets = jest.fn((_props: Record<string, unknown>) => null);

jest.mock('../components/return-result-sheets', () => ({
  ReturnResultSheets: (props: Record<string, unknown>) => mockResultSheets(props),
}));

const mockConfirmSheet = jest.fn((_props: Record<string, unknown>) => null);

jest.mock('../components/return-confirm-sheet', () => ({
  ReturnConfirmSheet: (props: Record<string, unknown>) => mockConfirmSheet(props),
}));

let mockController: Record<string, unknown>;

jest.mock('../hooks/use-return-create-controller', () => ({
  useReturnCreateController: () => mockController,
}));

function makeController(overrides: Record<string, unknown> = {}) {
  return {
    canCreateReturn: true,
    canSubmit: false,
    clearError: jest.fn(),
    closeSuccess: jest.fn(),
    confirmation: {
      close: jest.fn(),
      confirm: jest.fn(),
      isConfirming: false,
      open: false,
      request: jest.fn(),
    },
    confirmSummary: { items: [], details: [] },
    errorMessage: null,
    giftRows: [],
    handleRecreatePtt: jest.fn(),
    handleSubmit: jest.fn(),
    retrySubmit: jest.fn(),
    iban: { setIbanError: jest.fn() },
    isError: false,
    isLoading: false,
    isRecreating: false,
    isStorePickup: false,
    isSubmitting: false,
    itemPhotos: {},
    itemReasons: {},
    order: {
      deliveredAt: '01.07.2026',
      items: [],
      orderNo: 'ORD-1',
    },
    paymentError: null,
    paymentLoading: false,
    paymentMethods: [],
    reasons: [],
    reasonsError: null,
    reasonsLoading: false,
    refetch: jest.fn(),
    refund: {
      isGiftVoucher: false,
      methods: [],
      select: jest.fn(),
      selected: null,
      selectedId: null,
      showSelector: false,
    },
    refundError: null,
    refundLoading: false,
    returnableGroups: [],
    returnableRows: [],
    returnBlockReason: null,
    returnMethod: 'ptt',
    scheduled: {
      pickupSubmitting: false,
    },
    selectedItems: [],
    setItemPhoto: jest.fn(),
    setItemReason: jest.fn(),
    setNote: mockSetNote,
    setReturnMethod: jest.fn(),
    shouldCollectIban: false,
    shouldShowIbanSelect: false,
    successMessage: null,
    toggleItem: jest.fn(),
    toggleGroup: jest.fn(),
    note: '',
    ...overrides,
  };
}

describe('ReturnCreateScreen', () => {
  beforeEach(() => {
    mockSetNote.mockClear();
    mockConfirmSheet.mockClear();
    mockResultSheets.mockClear();
    mockPush.mockClear();
    mockController = makeController();
  });

  it('keeps the note field inside a keyboard-aware form scroller', () => {
    renderWithTamagui(<ReturnCreateScreen />);

    const scroller = screen.getByTestId('return-create-keyboard-aware-scroll');
    expect(scroller.props.bottomOffset).toBe(120);
    expect(scroller.props.bounces).toBe(false);
    expect(scroller.props.overScrollMode).toBe('never');
    expect(StyleSheet.flatten(scroller.props.contentContainerStyle)?.paddingBottom).toBeUndefined();
    expect(screen.getByLabelText('Not (opsiyonel)')).toBeTruthy();
  });

  // Regression: iade başarıyla oluşunca sipariş yeniden çekilir ve ekran
  // "zaten oluşturuldu" durumuna geçerdi; engel dalı sheet'leri render etmediği
  // için başarı sheet'i sönüyor ve başarı hata gibi görünüyordu.
  it('stays on the form flow while the success sheet is showing, even if the order became blocked', () => {
    mockController = makeController({
      canCreateReturn: false,
      returnBlockReason: 'already_requested',
      successMessage: 'İade talebiniz alındı.',
    });

    renderWithTamagui(<ReturnCreateScreen />);

    expect(screen.getByTestId('return-create-keyboard-aware-scroll')).toBeTruthy();
    expect(screen.queryByText('Bu sipariş için zaten iade talebi oluşturulmuştur.')).toBeNull();
  });

  it('offers the refund-method choice and keeps the IBAN block for the IBAN option', () => {
    mockController = makeController({
      refund: {
        isGiftVoucher: false,
        methods: [
          { id: 1, name: 'IBAN', code: 'iban' },
          { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' },
        ],
        select: jest.fn(),
        selected: { id: 1, name: 'IBAN', code: 'iban' },
        selectedId: 1,
        showSelector: true,
      },
      shouldCollectIban: true,
      shouldShowIbanSelect: true,
    });

    renderWithTamagui(<ReturnCreateScreen />);

    expect(screen.getByText('Geri Ödeme Yöntemi')).toBeTruthy();
    expect(screen.getByLabelText('Hediye Çeki')).toBeTruthy();
    expect(screen.getByText("İade IBAN'ı")).toBeTruthy();
  });

  it('hides the IBAN block once the gift voucher is the selected refund method', () => {
    mockController = makeController({
      refund: {
        isGiftVoucher: true,
        methods: [
          { id: 1, name: 'IBAN', code: 'iban' },
          { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' },
        ],
        select: jest.fn(),
        selected: { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' },
        selectedId: 2,
        showSelector: true,
      },
      shouldCollectIban: false,
      shouldShowIbanSelect: true,
    });

    renderWithTamagui(<ReturnCreateScreen />);

    expect(screen.getByText('Geri Ödeme Yöntemi')).toBeTruthy();
    expect(screen.queryByText("İade IBAN'ı")).toBeNull();
  });

  // İade isteği doğrudan gitmez: buton önce ürün/neden özetini onaya açar.
  it('opens the review sheet instead of submitting straight away', () => {
    mockController = makeController({ canSubmit: true });

    renderWithTamagui(<ReturnCreateScreen />);
    fireEvent.press(screen.getByLabelText('İade Talebi Oluştur'));

    const confirmation = mockController.confirmation as { request: jest.Mock };
    expect(confirmation.request).toHaveBeenCalledTimes(1);
    expect(mockController.handleSubmit).not.toHaveBeenCalled();
  });

  it('feeds the review sheet with the summary and confirmation state', () => {
    const summary = {
      items: [
        {
          key: '10:1',
          name: 'Pijama Takımı',
          variantName: 'S-M',
          imageUrl: null,
          quantity: 1,
          reasonName: 'Beden büyük geldi',
          isGift: false,
        },
      ],
      details: [{ label: 'İade Yöntemi', value: 'PTT Kargo Şubesinden Gönder' }],
    };
    const close = jest.fn();
    mockController = makeController({
      confirmSummary: summary,
      confirmation: { close, confirm: jest.fn(), isConfirming: true, open: true, request: jest.fn() },
      scheduled: { pickupSubmitting: true },
    });

    renderWithTamagui(<ReturnCreateScreen />);

    const props = mockConfirmSheet.mock.calls.at(-1)?.[0] as Record<string, any>;
    expect(props).toEqual(
      expect.objectContaining({ open: true, isConfirming: true, isSchedulingPickup: true, summary }),
    );
    props.onOpenChange(false);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('renders the web-parity blocked screen with a back-to-orders action', () => {
    mockController = makeController({
      canCreateReturn: false,
      returnBlockReason: 'already_requested',
    });

    renderWithTamagui(<ReturnCreateScreen />);

    expect(screen.getByText('İade Talebi Oluşturulamıyor')).toBeTruthy();
    expect(screen.getByText('Bu sipariş için zaten iade talebi oluşturulmuştur.')).toBeTruthy();
    expect(screen.getByLabelText('Siparişlerime Dön')).toBeTruthy();
  });

  // Web 18c98462e: iade koşulları kutusu ürün listesinin üstünde, bağlantı tüm koşulları açar.
  it('shows the return conditions notice and opens the full policy page from its link', () => {
    renderWithTamagui(<ReturnCreateScreen />);

    expect(screen.getByText('İade Koşulları')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Tüm iptal ve iade koşullarını inceleyin'));

    expect(mockPush).toHaveBeenCalledWith('/bilgi/iptal-iade-kosullari');
  });

  it('wires the error sheet retry to the controller and gates it on submittability', () => {
    mockController = makeController({ canSubmit: true, errorMessage: 'Sunucu hatası' });

    renderWithTamagui(<ReturnCreateScreen />);

    const props = mockResultSheets.mock.calls.at(-1)?.[0] as Record<string, any>;
    expect(props.canRetry).toBe(true);
    expect(props.onRetry).toBe(mockController.retrySubmit);
    expect(props.onRecreatePtt).toBe(mockController.handleRecreatePtt);
  });
});
