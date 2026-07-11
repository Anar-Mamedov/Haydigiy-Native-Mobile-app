import { createElement } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCheckoutAddressesQuery } from '@/features/checkout/api/checkout.queries';
import { useSavedAddressesQuery } from '@/features/order/api/return.queries';
import * as addressService from '@/services/address.service';
import { useAddressesQuery } from './address.queries';
import { useUpdateAddressMutation } from './address.mutations';

jest.mock('@/services/address.service', () => ({
  ...jest.requireActual('@/services/address.service'),
  getAddressesDto: jest.fn(),
  updateAddressDto: jest.fn(),
}));

const getAddressesDto = addressService.getAddressesDto as jest.MockedFunction<
  typeof addressService.getAddressesDto
>;
const updateAddressDto = addressService.updateAddressDto as jest.MockedFunction<
  typeof addressService.updateAddressDto
>;

function createQueryHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  return { queryClient, wrapper };
}

const oldAddress = {
  id: 7,
  title: 'Ev',
  name: 'Anar',
  surname: 'Mamedov',
  phone: '05551234567',
  address_line: 'Eski adres',
  city_id: 34,
  district_id: 198,
  neighbourhood_id: 1024,
};

describe('saved-address cache invalidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shares one remote address request across address, checkout and return consumers', async () => {
    getAddressesDto.mockResolvedValue([oldAddress]);
    const { queryClient, wrapper } = createQueryHarness();

    const { result, unmount } = renderHook(
      () => ({
        addresses: useAddressesQuery(),
        checkout: useCheckoutAddressesQuery(),
        returns: useSavedAddressesQuery(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.addresses.data?.[0]?.addressLine).toBe('Eski adres');
      expect(result.current.checkout.data?.[0]?.addressLine).toBe('Eski adres');
      expect(result.current.returns.data?.[0]?.addressLine).toBe('Eski adres');
    });

    expect(getAddressesDto).toHaveBeenCalledTimes(1);
    unmount();
    queryClient.clear();
  });

  it('waits for the active address list to refresh before update completes', async () => {
    getAddressesDto
      .mockResolvedValueOnce([oldAddress])
      .mockResolvedValueOnce([{ ...oldAddress, address_line: 'Yeni adres' }]);
    updateAddressDto.mockResolvedValue(undefined);
    const { queryClient, wrapper } = createQueryHarness();

    const { result, unmount } = renderHook(
      () => ({
        addresses: useAddressesQuery(),
        update: useUpdateAddressMutation(),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.addresses.data?.[0]?.addressLine).toBe('Eski adres'),
    );

    await act(async () => {
      await result.current.update.mutateAsync({
        id: '7',
        input: {
          title: 'Ev',
          name: 'Anar',
          surname: 'Mamedov',
          phone: '05551234567',
          cityId: '34',
          districtId: '198',
          neighbourhoodId: '1024',
          addressLine: 'Yeni adres',
          invoiceType: 'individual',
        },
      });
    });

    expect(updateAddressDto).toHaveBeenCalledTimes(1);
    expect(getAddressesDto).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(result.current.addresses.data?.[0]?.addressLine).toBe('Yeni adres'),
    );
    unmount();
    queryClient.clear();
  });
});
