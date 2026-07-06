import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { orderKeys } from './order.keys';
import { mapOrdersResponse, mapReturnRequestsResponse } from './order.mapper';
import { mapOrderDetail } from './order-detail.mapper';
import { mapOrderCargoTracking } from './order-tracking.mapper';
import { mapCancellationReason } from './order-cancel.mapper';
import {
  getCancellationReasonsDto,
  getOrderCargoTrackingDto,
  getOrderByIdDto,
  getOrdersDto,
  getReturnRequestsDto,
} from '@/services/order.service';
import {
  CancellationReason,
  OrderCargoTracking,
  OrderDetail,
  OrderFilters,
  OrdersPage,
} from '@/types/order.types';

/**
 * Single-page orders feed (numbered pagination, like the web order list). The
 * "returned" filter reads `/return-requests`; every other filter reads `/order`.
 * Previous page data is kept while a new page loads to avoid list flicker.
 */
export function useOrdersQuery(filters: OrderFilters, page: number, enabled = true) {
  return useQuery<OrdersPage>({
    queryKey: orderKeys.list(filters, page),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const params = {
        page,
        search: filters.search,
        category: filters.category,
        dateFilter: filters.dateFilter,
      };

      if (filters.category === 'returned') {
        return mapReturnRequestsResponse(await getReturnRequestsDto(params));
      }
      return mapOrdersResponse(await getOrdersDto(params));
    },
  });
}

/** Loads a single order's detail (`GET /order/{id}`). */
export function useOrderDetailQuery(id: string, enabled = true) {
  return useQuery<OrderDetail | null>({
    queryKey: orderKeys.detail(id),
    enabled: enabled && Boolean(id),
    queryFn: async () => {
      const dto = await getOrderByIdDto(id);
      return dto ? mapOrderDetail(dto) : null;
    },
  });
}

/** Loads cargo tracking movements for a single order (`GET /order/{id}/cargo-tracking`). */
export function useOrderCargoTrackingQuery(id: string, enabled = true) {
  return useQuery<OrderCargoTracking | null>({
    queryKey: orderKeys.cargoTracking(id),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
    queryFn: async () => {
      const dto = await getOrderCargoTrackingDto(id);
      return dto ? mapOrderCargoTracking(dto) : null;
    },
  });
}

/** Loads cancellation reasons (`GET /order/cancellation-reasons`). */
export function useCancellationReasonsQuery(enabled = true) {
  return useQuery<CancellationReason[]>({
    queryKey: orderKeys.cancellationReasons(),
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const dtos = await getCancellationReasonsDto();
      return dtos.map(mapCancellationReason);
    },
  });
}
