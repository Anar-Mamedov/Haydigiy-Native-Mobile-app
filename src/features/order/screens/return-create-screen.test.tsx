import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ReturnCreateScreen } from './return-create-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const mockSetNote = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'order-1' }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, replace: jest.fn() }),
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
    EmptyState: ({ title }: any) => React.createElement(Text, null, title),
    KeyboardAwareFormScrollView: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    SectionCard: ({ children }: any) => React.createElement(View, null, children),
  };
});

jest.mock('../components/new-iban-modal', () => ({
  NewIbanModal: () => null,
}));

jest.mock('../components/return-result-sheets', () => ({
  ReturnResultSheets: () => null,
}));

jest.mock('../hooks/use-return-create-controller', () => ({
  useReturnCreateController: () => ({
    canCreateReturn: true,
    canSubmit: false,
    clearError: jest.fn(),
    closeSuccess: jest.fn(),
    errorMessage: null,
    giftItems: [],
    handleRecreatePtt: jest.fn(),
    handleSubmit: jest.fn(),
    iban: {},
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
    returnableItems: [],
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
    shouldShowIbanSelect: false,
    successMessage: null,
    toggleItem: jest.fn(),
    note: '',
  }),
}));

describe('ReturnCreateScreen', () => {
  beforeEach(() => {
    mockSetNote.mockClear();
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
});
