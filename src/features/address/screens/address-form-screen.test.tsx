import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AddressFormScreen } from './address-form-screen';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => callback(),
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn() }),
}));

jest.mock('@/features/auth/hooks/use-auth-status', () => ({
  useAuthStatus: () => ({ isAuthenticated: true, isLoading: false }),
}));

jest.mock('@/features/auth/store/use-auth-store', () => ({
  useAuthStore: (selector: any) => selector({ user: { name: 'Anar', phoneNumber: '05076543210', surname: 'Mammadov' } }),
}));

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { Text, View } = jest.requireActual('react-native');

  return {
    AppScreen: ({ children, ...props }: any) => React.createElement(View, props, children),
    EmptyState: ({ title }: any) => React.createElement(Text, null, title),
    KeyboardAwareFormScrollView: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    ScreenHeader: ({ title }: any) => React.createElement(Text, null, title),
  };
});

jest.mock('../api/address.queries', () => ({
  useAddressQuery: () => ({ data: null, isError: false, isPending: false, refetch: jest.fn() }),
}));

jest.mock('../components/address-form', () => ({
  AddressForm: () => null,
  EMPTY_ADDRESS_VALUES: {
    addressLine: '',
    cityId: '',
    companyName: '',
    districtId: '',
    invoiceType: 'individual',
    isEFatura: false,
    name: '',
    neighbourhoodId: '',
    phone: '',
    surname: '',
    taxNumber: '',
    taxOffice: '',
    tcNumber: '',
    title: '',
  },
}));

describe('AddressFormScreen', () => {
  it('renders the address form inside a keyboard-aware scroller', () => {
    renderWithTamagui(<AddressFormScreen />);

    const scroller = screen.getByTestId('address-form-keyboard-aware-scroll');
    expect(scroller.props.bottomOffset).toBe(96);
    expect(StyleSheet.flatten(scroller.props.contentContainerStyle)).toMatchObject({
      flexGrow: 1,
      padding: 16,
    });
  });
});
