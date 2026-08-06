import { FeatureIcon, ProductVariant } from '@/types/product.types';
import { mapFeatureIconDtos } from './product.mapper';
import { mapVariants } from './variant.mapper';
import { ProductQuestionsPageDto } from './product-questions.dtos';

export type QaProduct = {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  cartCount: number;
  favoritesCount: number;
  totalQuantity: number;
  featureIcons: FeatureIcon[];
  variants: ProductVariant[];
};

export type ProductQAReply = {
  adminName: string;
  text: string;
  createdAt: string;
};

export type ProductQAItem = {
  id: string;
  question: string;
  userName: string;
  createdAt: string;
  likeCount: number;
  tag: string | null;
  reply: ProductQAReply | null;
};

export type ProductQuestionsPage = {
  product: QaProduct;
  tags: string[];
  questions: ProductQAItem[];
};

function mapTags(filters: ProductQuestionsPageDto['filters']): string[] {
  if (Array.isArray(filters)) return filters;
  return filters?.tags ?? [];
}

export function mapProductQuestionsPage(dto: ProductQuestionsPageDto): ProductQuestionsPage {
  return {
    product: {
      id: dto.product?.id ? String(dto.product.id) : '',
      name: dto.product?.name ?? '',
      imageUrl: dto.product?.media?.medium ?? dto.product?.media?.thumb ?? '',
      price: dto.product?.price ?? '',
      cartCount: Number(dto.product?.cart_count) || 0,
      favoritesCount: Number(dto.product?.favorites_count) || 0,
      totalQuantity: Number(dto.product?.total_quantity) || 0,
      featureIcons: mapFeatureIconDtos(dto.product?.feature_icons),
      variants: mapVariants(dto.product?.variants as never),
    },
    tags: mapTags(dto.filters),
    questions: (dto.questions?.data ?? []).map((question) => ({
      id: String(question.id),
      question: question.question ?? '',
      userName: question.user_name ?? '',
      createdAt: question.created_at ?? '',
      likeCount: Number(question.like_count) || 0,
      tag: question.tag ?? null,
      reply: question.reply
        ? {
            adminName: question.reply.admin_name ?? '',
            text: question.reply.text ?? '',
            createdAt: question.reply.created_at ?? '',
          }
        : null,
    })),
  };
}
