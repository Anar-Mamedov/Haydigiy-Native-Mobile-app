import { SearchProductDto } from '@/features/product/api/product.dtos';

export interface FavoriteVariantDto {
  id: number;
  name: string;
  variant_id?: number;
  quantity?: number | string;
  price?: string | null;
}

export interface FavoriteProductDto extends Omit<SearchProductDto, 'variants'> {
  variants?: FavoriteVariantDto[];
  categories?: string[];
  main_category?: string;
  is_approved_for_sale?: number;
}

export interface FavoriteItemDto {
  product_id: number;
  total_favorites: number;
  product: FavoriteProductDto;
}

export interface FavoritesResponseDto {
  favorites: FavoriteItemDto[];
}
