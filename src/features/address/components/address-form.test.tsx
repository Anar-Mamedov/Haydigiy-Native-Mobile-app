import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AddressForm, EMPTY_ADDRESS_VALUES } from './address-form';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { AddressFormValues } from '@/types/address.types';

const mockAddAddress = jest.fn();
const mockUpdateAddress = jest.fn();

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
    AppCheckbox: jest.requireActual('@/components/ui/app-checkbox').AppCheckbox,
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
  useAddAddressMutation: () => ({ mutateAsync: mockAddAddress }),
  useUpdateAddressMutation: () => ({ mutateAsync: mockUpdateAddress }),
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

const SAVED_ADDRESS: AddressFormValues = {
  ...EMPTY_ADDRESS_VALUES,
  title: 'Ev',
  name: 'Anar',
  surname: 'Mamedov',
  phone: '5551234567',
  cityId: '34',
  districtId: '198',
  neighbourhoodId: '1024',
  addressLine: 'Cadde 1',
};

describe('AddressForm default address', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddAddress.mockResolvedValue(undefined);
    mockUpdateAddress.mockResolvedValue(undefined);
  });

  it('starts unticked for a new address and sends that choice', async () => {
    const onSuccess = jest.fn();
    renderWithTamagui(
      <AddressForm initialValues={SAVED_ADDRESS} mode="create" onSuccess={onSuccess} />,
    );

    expect(screen.getByText('Varsayılan adres olarak kullan')).toBeTruthy();
    expect(screen.getByText('Siparişlerde bu adres öncelikli olarak seçilir.')).toBeTruthy();
    expect(
      screen.getByLabelText('Varsayılan adres olarak kullan').props.accessibilityState,
    ).toMatchObject({ checked: false });

    fireEvent.press(screen.getByLabelText('Kaydet'));

    await waitFor(() =>
      expect(mockAddAddress).toHaveBeenCalledWith(expect.objectContaining({ isDefault: false })),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('sends a ticked box when creating an address', async () => {
    renderWithTamagui(
      <AddressForm initialValues={SAVED_ADDRESS} mode="create" onSuccess={jest.fn()} />,
    );

    fireEvent.press(screen.getByLabelText('Varsayılan adres olarak kullan'));
    fireEvent.press(screen.getByLabelText('Kaydet'));

    await waitFor(() =>
      expect(mockAddAddress).toHaveBeenCalledWith(expect.objectContaining({ isDefault: true })),
    );
  });

  it('prefills the saved default flag when editing and sends a change', async () => {
    renderWithTamagui(
      <AddressForm
        addressId="7"
        initialValues={{ ...SAVED_ADDRESS, isDefault: true }}
        mode="edit"
        onSuccess={jest.fn()}
      />,
    );

    const checkbox = screen.getByLabelText('Varsayılan adres olarak kullan');
    expect(checkbox.props.accessibilityState).toMatchObject({ checked: true });

    fireEvent.press(checkbox);
    fireEvent.press(screen.getByLabelText('Kaydet'));

    await waitFor(() =>
      expect(mockUpdateAddress).toHaveBeenCalledWith({
        id: '7',
        input: expect.objectContaining({ isDefault: false, title: 'Ev' }),
      }),
    );
  });

  it('keeps the checkbox labels readable in dark theme', () => {
    renderWithTamagui(
      <AddressForm initialValues={SAVED_ADDRESS} mode="create" onSuccess={jest.fn()} />,
      'dark',
    );

    expect(screen.getByText('Varsayılan adres olarak kullan')).toBeTruthy();
    expect(screen.getByLabelText('Varsayılan adres olarak kullan')).toBeTruthy();
  });
});
