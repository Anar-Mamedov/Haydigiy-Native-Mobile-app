import { useQuery } from '@tanstack/react-query';
import { addressKeys } from './address.keys';
import { mapAddress, mapAddressToFormValues } from './address.mapper';
import {
  getAddressByIdDto,
  getAddressesDto,
  getCitiesDto,
  getDistrictsDto,
  getNeighbourhoodsDto,
} from '@/services/address.service';
import { Address, AddressFormValues } from '@/types/address.types';
import { LocationOption } from '@/types/order.types';

/** Loads the user's saved addresses (`GET /addresses`) for the list screen. */
export function useAddressesQuery(enabled = true) {
  return useQuery<Address[]>({
    queryKey: addressKeys.lists(),
    enabled,
    queryFn: async () => {
      const dtos = await getAddressesDto();
      return dtos.map(mapAddress);
    },
  });
}

/** Loads a single address (`GET /addresses/{id}`) prefilled as form values. */
export function useAddressQuery(id: string | undefined) {
  return useQuery<AddressFormValues | null>({
    queryKey: addressKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const dto = await getAddressByIdDto(id ?? '');
      return dto ? mapAddressToFormValues(dto) : null;
    },
  });
}

/** Provinces (`GET /address/cities`). */
export function useCitiesQuery(enabled = true) {
  return useQuery<LocationOption[]>({
    queryKey: addressKeys.cities(),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: () => getCitiesDto(),
  });
}

/** Districts for the selected province (`GET /address/districts/{cityId}`). */
export function useDistrictsQuery(cityId: string) {
  return useQuery<LocationOption[]>({
    queryKey: addressKeys.districts(cityId),
    enabled: Boolean(cityId),
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: () => getDistrictsDto(cityId),
  });
}

/** Neighbourhoods for the selected district (`GET /address/neighbourhoods/{id}`). */
export function useNeighbourhoodsQuery(districtId: string) {
  return useQuery<LocationOption[]>({
    queryKey: addressKeys.neighbourhoods(districtId),
    enabled: Boolean(districtId),
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: () => getNeighbourhoodsDto(districtId),
  });
}
