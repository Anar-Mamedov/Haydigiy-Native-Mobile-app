import { ActivityMetaDto, ActivityProductDto } from '@/utils/account-activity';

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

/** `GET /review/my-reviews` kaydı: kullanıcının kendi yazdığı yorum. */
export interface MyReviewEntryDto {
  id?: number | string | null;
  rating?: number | string | null;
  comment?: string | null;
  status?: string | null;
  created_at?: string | null;
  like_count?: number | string | null;
  height?: number | string | null;
  weight?: number | string | null;
  size?: string | null;
  photo?: string | null;
  thumbnail?: string | null;
  order_id?: number | string | null;
  product?: ActivityProductDto | null;
}

export interface MyReviewEntriesResponseDto {
  data?: MyReviewEntryDto[];
  meta?: ActivityMetaDto | null;
}
