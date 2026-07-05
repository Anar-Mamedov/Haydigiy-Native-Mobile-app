import { QuickFilterGroup } from '@/types/product.types';
import { QuickFilterResponseDto } from './quick-filter.dtos';

/**
 * Maps `/quick-filter/{categoryId}` payloads into domain groups, mirroring the
 * web `fetchQuickFilters` validation: anything other than a `success` payload
 * maps to no groups, and malformed groups/values or groups left without values
 * are dropped so the UI never renders an unusable pill.
 */
export function mapQuickFilterResponseDto(
  dto: QuickFilterResponseDto | null | undefined,
): QuickFilterGroup[] {
  if (!dto || dto.status !== 'success' || !Array.isArray(dto.data)) return [];

  return dto.data
    .filter(
      (group) =>
        group != null &&
        typeof group.id === 'number' &&
        typeof group.name === 'string' &&
        group.name.trim() !== '' &&
        Array.isArray(group.values),
    )
    .map((group) => ({
      id: group.id,
      name: group.name,
      values: group.values
        .filter(
          (value) =>
            value != null &&
            typeof value.id === 'number' &&
            typeof value.name === 'string' &&
            value.name.trim() !== '',
        )
        .map((value) => ({ id: value.id, name: value.name })),
    }))
    .filter((group) => group.values.length > 0);
}
