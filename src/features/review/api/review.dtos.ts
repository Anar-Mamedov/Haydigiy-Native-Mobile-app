export interface ReviewItemDto {
  review_id?: number;
  order_item_id: number;
  order_id: number;
  product_id: number;
  variant_id: number;
  slug: string;
  product_name: string;
  variant_name?: string | null;
  product_image?: string | null;
  delivered_at?: string | null;
  review?: {
    rating?: number | string | null;
    comment?: string | null;
    status?: string | number | null;
  } | null;
  product_review?: boolean;
}

export interface ReviewTabDto {
  key: string;
  label: string;
}

export interface MyReviewsResponseDto {
  data?: ReviewItemDto[];
  tabs?: ReviewTabDto[];
}
