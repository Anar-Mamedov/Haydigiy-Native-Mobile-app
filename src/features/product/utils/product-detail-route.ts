import { Product } from '@/types/product.types';

/** Fields required to open the product detail screen with an instant preview. */
type ProductRouteSource = Pick<
  Product,
  'id' | 'slug' | 'title' | 'price' | 'imageUrl' | 'brand' | 'sellerName' | 'shippingLabel' | 'images'
>;

/**
 * Builds the product detail route with preview params.
 *
 * Navigating by `slug` lets `useProductDetailsQuery` skip the extra id→slug
 * resolution round-trip (one request instead of two), and the preview params
 * let the screen render immediately from cached list data instead of showing a
 * blank spinner until the detail request returns (mirrors the web
 * `initialProduct` pattern).
 *
 * `imageIndex` is the image currently shown in the list card; it is forwarded so
 * the detail carousel opens on the same image (and the preview shows it too).
 */
export function buildProductDetailRoute(product: ProductRouteSource, imageIndex = 0) {
  const safeIndex = Number.isFinite(imageIndex) && imageIndex > 0 ? Math.floor(imageIndex) : 0;
  const previewImage = product.images?.[safeIndex] || product.imageUrl;

  return {
    pathname: '/product/[id]' as const,
    params: {
      id: product.slug || product.id,
      title: product.title,
      price: String(product.price),
      imageUrl: previewImage,
      brand: product.brand,
      sellerName: product.sellerName,
      shippingLabel: product.shippingLabel ?? '',
      imageIndex: String(safeIndex),
    },
  };
}
