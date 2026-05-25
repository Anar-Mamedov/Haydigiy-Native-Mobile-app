import { useQuery } from '@tanstack/react-query';
import { categoryKeys } from './category.keys';
import { fetchMenuGroups, fetchMenuItems, fetchCategoryFirstProductImage } from '../services/category.service';

export function useMenuGroupsQuery() {
  return useQuery({
    queryFn: fetchMenuGroups,
    queryKey: categoryKeys.groups(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMenuItemsQuery(groupId: number | null | undefined) {
  return useQuery({
    queryFn: () => (groupId ? fetchMenuItems(groupId) : Promise.resolve([])),
    queryKey: categoryKeys.items(groupId || 0),
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategoryFirstProductImageQuery(categoryId: number | null | undefined) {
  return useQuery({
    queryFn: () => (categoryId ? fetchCategoryFirstProductImage(categoryId) : Promise.resolve({ image: null })),
    queryKey: categoryKeys.firstProductImage(categoryId || 0),
    enabled: !!categoryId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
