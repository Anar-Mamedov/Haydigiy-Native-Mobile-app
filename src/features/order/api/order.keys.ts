import { OrderFilters } from '@/types/order.types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters, page: number) => [...orderKeys.lists(), filters, page] as const,
};
