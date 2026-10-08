import { ShowcaseProduct } from '../api/product-showcase.mapper';
import { buildProductDetailRoute } from './product-detail-route';

/** Vitrin ürününden, detayı anında önizlemeyle açan ürün rotasını kurar. */
export function buildShowcaseProductRoute(product: ShowcaseProduct) {
  return buildProductDetailRoute({
    id: product.id,
    imageUrl: product.imageUrl ?? '',
    price: product.price,
    slug: product.slug,
    title: product.title,
  });
}
