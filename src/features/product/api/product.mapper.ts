import { ProductDto } from '@/features/product/api/product.dtos';
import { Product } from '@/types/product.types';

export function mapProductDto(dto: ProductDto): Product {
  return {
    badge: dto.badge,
    brand: dto.brand_name,
    category: dto.category_name,
    currency: dto.currency_code,
    description: dto.description_text,
    id: dto.id,
    imageUrl: dto.image_url,
    originalPrice: dto.original_price,
    price: dto.price,
    rating: dto.rating,
    reviewCount: dto.review_count,
    sellerName: dto.seller_name,
    shippingLabel: dto.shipping_label,
    slug: dto.slug,
    title: dto.title,
  };
}
