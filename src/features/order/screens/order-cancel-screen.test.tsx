import { screen } from '@testing-library/react-native';
import { OrderCancelScreen } from './order-cancel-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'order-1' }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/features/auth/hooks/use-auth-status', () => ({
  useAuthStatus: () => ({ isAuthenticated: true, isLoading: false }),
}));

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View, Text } = jest.requireActual('react-native');

  return {
    AppScreen: ({ children }: any) => React.createElement(View, null, children),
    EmptyState: ({ title }: any) => React.createElement(Text, null, title),
    SectionCard: ({ children }: any) => React.createElement(View, null, children),
  };
});

jest.mock('../components/orders-header', () => ({
  OrdersHeader: () => null,
}));

jest.mock('../components/cancel-reason-sheet', () => ({
  CancelReasonSheet: () => null,
}));

jest.mock('../components/campaign-break-warning-sheet', () => ({
  CampaignBreakWarningSheet: () => null,
}));

let mockController: Record<string, unknown>;

jest.mock('../hooks/use-order-cancel-controller', () => ({
  useOrderCancelController: () => mockController,
}));

function makeController(totals: Record<string, unknown>) {
  return {
    allSelectedHaveReasons: false,
    cancel: jest.fn(),
    cancelAll: jest.fn(),
    closeWarning: jest.fn(),
    confirmWarning: jest.fn(),
    isCancelable: true,
    isConfirming: false,
    isError: false,
    isLoading: false,
    isSubmitting: false,
    itemGroups: [],
    itemReasons: {},
    order: {
      cancelledItems: [],
      missingCases: [],
      createdAt: '09 Eki 2026',
      orderNo: 'HG0910261931529',
      status: 'Onaylandı',
      statusId: 2,
      totals,
    },
    reasons: [],
    selectedCount: 0,
    selectedIds: [],
    setReason: jest.fn(),
    showWarning: false,
    toggleGroup: jest.fn(),
    toggleSelect: jest.fn(),
    warningPreview: null,
  };
}

describe('OrderCancelScreen', () => {
  it('shows the installment total including vade farkı for installment orders', () => {
    mockController = makeController({ total: 199.98, payableTotal: 211.98 });

    renderWithTamagui(<OrderCancelScreen />);

    expect(screen.getByText('211.98 TL')).toBeTruthy();
    expect(screen.queryByText('199.98 TL')).toBeNull();
  });

  it('shows the cash total when the order has no installment interest', () => {
    mockController = makeController({ total: 199.98, payableTotal: 199.98 });

    renderWithTamagui(<OrderCancelScreen />);

    expect(screen.getByText('199.98 TL')).toBeTruthy();
  });
});
