import { ProductVariant } from '@/types/product.types';

const parseSafely = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

interface VariantDto {
  id: number | string;
  name: string;
  name_2?: string | null;
  quantity?: number | string;
  price?: number | string;
  pivot?: { id?: number | string; quantity?: number | string; price?: number | string };
}

/** Maps a raw variant DTO to the domain `ProductVariant` (shared across endpoints). */
export function mapVariant(dto: VariantDto): ProductVariant {
  const quantity = parseSafely(dto.pivot?.quantity ?? dto.quantity);
  return {
    id: String(dto.id),
    name: dto.name,
    name2: dto.name_2 ?? null,
    quantity,
    price: parseSafely(dto.pivot?.price ?? dto.price),
    hasStock: quantity > 0,
    pivotId: dto.pivot?.id != null ? String(dto.pivot.id) : String(dto.id),
  };
}

/** Maps an array of variant DTOs (or undefined) to domain variants. */
export function mapVariants(dtos: VariantDto[] | undefined): ProductVariant[] {
  return Array.isArray(dtos) ? dtos.map(mapVariant) : [];
}
