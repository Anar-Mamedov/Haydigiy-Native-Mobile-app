import { ProductVariant } from '@/types/product.types';
import { maskName } from '../utils/mask-name';
import { mapVariants } from './variant.mapper';
import { ProductReviewPageDto } from './product-reviews.dtos';

export type ReviewSummary = {
  average: number;
  total: number;
  stars: { 1: number; 2: number; 3: number; 4: number; 5: number };
  withPhotos: number;
};

export type ProductReviewItem = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  photo: string | null;
  createdAt: string;
  size: string | null;
  height: number | null;
  weight: number | null;
  likeCount: number;
};

export type ReviewFilterValues = {
  sizes: string[];
  heights: string[];
  weights: string[];
};

export type ReviewProduct = {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  cartCount: number;
  favoritesCount: number;
  totalQuantity: number;
  variants: ProductVariant[];
};

export type ProductReviewPage = {
  product: ReviewProduct;
  summary: ReviewSummary;
  filterValues: ReviewFilterValues;
  reviews: ProductReviewItem[];
};

const EMPTY_SUMMARY: ReviewSummary = {
  average: 0,
  total: 0,
  stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  withPhotos: 0,
};

export function mapProductReviewPage(dto: ProductReviewPageDto): ProductReviewPage {
  const summaryDto = dto.review_summary;
  return {
    product: {
      id: dto.product?.id ? String(dto.product.id) : '',
      name: dto.product?.name ?? '',
      imageUrl: dto.product?.media?.medium ?? '',
      price: dto.product?.price ?? '',
      cartCount: Number(dto.product?.cart_count) || 0,
      favoritesCount: Number(dto.product?.favorites_count) || 0,
      totalQuantity: Number(dto.product?.total_quantity) || 0,
      variants: mapVariants(dto.product?.variants as never),
    },
    summary: summaryDto
      ? {
          average: Number(summaryDto.average) || 0,
          total: Number(summaryDto.total) || 0,
          stars: {
            1: summaryDto.stars?.[1] ?? 0,
            2: summaryDto.stars?.[2] ?? 0,
            3: summaryDto.stars?.[3] ?? 0,
            4: summaryDto.stars?.[4] ?? 0,
            5: summaryDto.stars?.[5] ?? 0,
          },
          withPhotos: Number(summaryDto.with_photos) || 0,
        }
      : EMPTY_SUMMARY,
    filterValues: {
      sizes: dto.filters?.sizes ?? [],
      heights: dto.filters?.heights ?? [],
      weights: dto.filters?.weights ?? [],
    },
    reviews: (dto.reviews?.data ?? []).map((review) => ({
      id: String(review.id),
      userName: maskName(review.user_name ?? ''),
      rating: Number(review.rating) || 0,
      comment: review.comment ?? '',
      photo: review.photo ?? null,
      createdAt: review.created_at ?? '',
      size: review.size ?? null,
      height: review.height ?? null,
      weight: review.weight ?? null,
      likeCount: Number(review.like_count) || 0,
    })),
  };
}
