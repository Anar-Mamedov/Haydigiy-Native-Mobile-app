import { Product } from './product.types';

export interface FavoriteItem {
  productId: string;
  totalFavorites: number;
  product: Product;
}

export type FavoritesFilter = 'inStock' | 'discounted';
