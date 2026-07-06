import { OrderFilters } from '@/types/order.types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters, page: number) => [...orderKeys.lists(), filters, page] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  cargoTracking: (id: string) => [...orderKeys.detail(id), 'cargo-tracking'] as const,
  cancellationReasons: () => [...orderKeys.all, 'cancellation-reasons'] as const,
};
