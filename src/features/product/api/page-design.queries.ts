import { useQuery } from '@tanstack/react-query';
import { pageDesignKeys } from '@/features/product/api/page-design.keys';
import { fetchMobilePageDesign } from '@/services/page-design.service';

export function useMobilePageDesignQuery() {
  return useQuery({
    queryFn: fetchMobilePageDesign,
    queryKey: pageDesignKeys.mobile(),
  });
}
