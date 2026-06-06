import { FavoriteItemDto, FavoriteVariantDto } from './favorite.dtos';
import { FavoriteItem } from '@/types/favorite.types';
import { ProductVariant } from '@/types/product.types';
import { mapSearchProductDto } from '@/features/product/api/product.mapper';

function mapFavoriteVariant(v: FavoriteVariantDto): ProductVariant {
  const qty = typeof v.quantity === 'number' ? v.quantity : parseInt(String(v.quantity || '0'), 10);
  return {
    id: String(v.variant_id ?? v.id),
    name: v.name,
    name2: null,
    quantity: qty,
    price: v.price ? parseFloat(v.price) : 0,
    hasStock: qty > 0,
  };
}

export function mapFavoriteItemDto(dto: FavoriteItemDto): FavoriteItem {
  const product = mapSearchProductDto(dto.product);
  
  const variants: ProductVariant[] = Array.isArray(dto.product.variants)
    ? dto.product.variants.map(mapFavoriteVariant)
    : [];

  return {
    productId: String(dto.product_id),
    totalFavorites: dto.total_favorites ?? 0,
    product: {
      ...product,
      variants,
      categories: dto.product.categories ?? [],
      categorySlug: dto.product.category_slugs?.[0] ?? '',
      categoryId: dto.product.category_ids?.[0] ?? undefined,
    },
  };
}
