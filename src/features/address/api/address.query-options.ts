import { queryOptions } from '@tanstack/react-query';
import { addressKeys } from './address.keys';
import { getAddressesDto } from '@/services/address.service';

/**
 * Canonical saved-address query shared by every feature that reads `/addresses`.
 * Consumers map the raw DTOs with `select`, while the remote data keeps one
 * cache owner and one invalidation boundary.
 */
export function savedAddressesQueryOptions() {
  return queryOptions({
    queryKey: addressKeys.lists(),
    queryFn: getAddressesDto,
  });
}
