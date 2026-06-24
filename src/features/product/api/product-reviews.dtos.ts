/** Raw `GET /product/{slug}/review` response shape. */
export interface ProductReviewDto {
  id: number;
  user_name: string;
  rating: number;
  comment: string | null;
  photo: string | null;
  created_at: string;
  height: number | null;
  weight: number | null;
  size: string | null;
  like_count: number | null;
}

export interface ReviewSummaryDto {
  average: number;
  total: number;
  stars: { 1: number; 2: number; 3: number; 4: number; 5: number };
  with_photos: number;
}

export interface ReviewFiltersDto {
  sizes?: string[];
  heights?: string[];
  weights?: string[];
}

export interface ProductReviewPageDto {
  product?: {
    id?: number;
    name?: string;
    price?: string;
    media?: { medium?: string };
    cart_count?: number;
    favorites_count?: number;
    total_quantity?: number;
    variants?: unknown[];
  };
  review_summary?: ReviewSummaryDto;
  filters?: ReviewFiltersDto;
  reviews?: { data?: ProductReviewDto[] };
}
