import { fireEvent, screen } from '@testing-library/react-native';
import { AddressForm } from './address-form';
import { renderWithTamagui } from '@/test/render-with-tamagui';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  return {
    useFocusEffect: (callback: () => void) =>
      React.useEffect(() => {
        callback();
      }, [callback]),
  };
});

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { Pressable, Text, TextInput, View } = jest.requireActual('react-native');

  return {
    AppButton: ({ children, onPress }: any) =>
      React.createElement(Pressable, { accessibilityLabel: 'Kaydet', onPress }, children),
    AppInput: ({ label, onBlur, onChangeText, placeholder, value }: any) =>
      React.createElement(TextInput, {
        accessibilityLabel: label,
        onBlur,
        onChangeText,
        placeholder,
        value,
      }),
    AppSelect: ({ label, onValueChange, options, searchable, value }: any) =>
      React.createElement(
        View,
        { accessibilityLabel: label },
        label === 'Adres Başlığı *'
          ? React.createElement(
              Text,
              { testID: 'address-title-selected' },
              value ? String(value) : 'Seçiniz',
            )
          : null,
        label === 'Adres Başlığı *'
          ? React.createElement(
              Text,
              { testID: 'address-title-search-mode' },
              searchable ? 'searchable' : 'fixed',
            )
          : null,
        options.map((option: { label: string; value: string | number }) =>
          React.createElement(
            Pressable,
            {
              accessibilityLabel: `${label}:${option.label}`,
              key: String(option.value),
              onPress: () => onValueChange(option.value),
            },
            React.createElement(Text, null, option.label),
          ),
        ),
      ),
    SegmentedControl: () => React.createElement(View),
  };
});

jest.mock('../api/address.queries', () => ({
  useCitiesQuery: () => ({ data: [], isPending: false }),
  useDistrictsQuery: () => ({ data: [], isFetching: false }),
  useNeighbourhoodsQuery: () => ({ data: [], isFetching: false }),
}));

jest.mock('../api/address.mutations', () => ({
  useAddAddressMutation: () => ({ mutateAsync: jest.fn() }),
  useUpdateAddressMutation: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock('./invoice-fields', () => ({
  InvoiceFields: () => null,
}));

describe('AddressForm address title', () => {
  it('offers only the fixed options and updates the controlled select', () => {
    renderWithTamagui(<AddressForm mode="create" onSuccess={jest.fn()} />);

    expect(screen.getByText('Ev')).toBeTruthy();
    expect(screen.getByText('İş Yeri')).toBeTruthy();
    expect(screen.getByText('Okul')).toBeTruthy();
    expect(screen.getByTestId('address-title-search-mode').props.children).toBe('fixed');
    expect(screen.queryByPlaceholderText('Ev, İş, vb.')).toBeNull();

    fireEvent.press(screen.getByLabelText('Adres Başlığı *:İş Yeri'));

    expect(screen.getByTestId('address-title-selected').props.children).toBe('İş Yeri');
  });
});
