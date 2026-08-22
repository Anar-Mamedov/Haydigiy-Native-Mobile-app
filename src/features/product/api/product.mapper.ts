import {
  ProductFeatureIconDto,
  PopularProductDto,
  ProductDto,
  ProductSizeMeasurementDto,
  ProductSizeMeasurementPropertyDto,
  SearchProductColorDto,
  SearchProductDto,
  SearchProductsResponseDto,
} from '@/features/product/api/product.dtos';
import { getRequiredApiBaseUrl } from '@/lib/env';
import {
  Product,
  ProductAvailableFilters,
  ProductReview,
  ProductSize,
  FeatureIcon,
  PopularProduct,
  SizeMeasurement,
  SizeMeasurementEntry,
} from '@/types/product.types';
import { resolveCdnUrl } from '@/utils/cdn';
import { ProductReviewDto, ProductReviewPageDto } from './product-reviews.dtos';
import { mapBundleItems, mapBundleSummary } from './bundle.mapper';

function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  try {
    let baseUrl = getRequiredApiBaseUrl();
    // Strip trailing slashes and /api if present
    baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    const storagePath = path.startsWith('/storage/')
      ? path
      : path.startsWith('storage/')
      ? `/${path}`
      : `/storage/${path}`;
    return `${baseUrl}${storagePath}`;
  } catch {
    return '';
  }
}

function getOptionalImageUrl(path: string | null | undefined): string | null {
  const imageUrl = getImageUrl(path);
  return imageUrl || null;
}

function parseSafely(value: any, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

function toMediumImagePath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.includes('/medium/')) return path;
  return path.replace(/\/(large|thumb)\//, '/medium/');
}

function resolveMediumImagePath(...paths: (string | null | undefined)[]): string | null {
  for (const path of paths) {
    const mediumPath = toMediumImagePath(path);
    if (mediumPath) return mediumPath;
  }

  return null;
}

function extractOtherColors(dto: SearchProductDto): SearchProductColorDto[] {
  if (!dto.other_colors) return [];

  if (Array.isArray(dto.other_colors)) {
    return dto.other_colors;
  }

  return Array.isArray(dto.other_colors.data) ? dto.other_colors.data : [];
}

/**
 * Ürünün kendi renk adı. Backend aynı bilgiyi iki şekilde döndürüyor:
 * arama/liste yanıtlarında hem `color_name` hem `color: { name }`. Ürün detay
 * uçları `color` ilişkisini eager-load etmediğinde alan hiç gelmez; bu durumda
 * `undefined` kalır ve Insider ürün objesine `color` eklenmez.
 */
function extractColorName(dto: {
  color?: { name?: string | null } | null;
  color_name?: string | null;
}): string | undefined {
  const name = dto.color?.name ?? dto.color_name;
  const trimmed = typeof name === 'string' ? name.trim() : '';
  return trimmed || undefined;
}

function getColorImagePath(color: SearchProductColorDto): string | null {
  return resolveMediumImagePath(
    color.image?.medium,
    color.image?.thumb,
    color.image?.large,
    color.media?.path?.medium,
    color.media?.path?.thumb,
    color.media?.path?.large,
    color.media?.medium,
    color.media?.thumb,
    color.media?.large,
  );
}

function mapFeatureIconDto(icon: ProductFeatureIconDto): FeatureIcon {
  return {
    id: icon.id,
    name: icon.name || '',
    slug: icon.slug || '',
    description: icon.description ?? null,
    descriptionBgColor: icon.description_bg_color ?? null,
    assetUrl: getImageUrl(icon.asset_url ?? icon.asset_path),
    positionHint: icon.position_hint ?? null,
    displayOrder: icon.pivot?.display_order ?? icon.display_order ?? null,
    sortOrder: icon.sort_order ?? null,
    position: icon.pivot?.position ?? icon.position ?? null,
  };
}

/**
 * Maps a raw `feature_icons` payload, tolerating a missing or malformed list.
 * Shared by the detail, reviews and Q&A page mappers.
 */
export function mapFeatureIconDtos(icons: ProductFeatureIconDto[] | null | undefined): FeatureIcon[] {
  return Array.isArray(icons) ? icons.map(mapFeatureIconDto) : [];
}

type AvailableFiltersDto = NonNullable<SearchProductsResponseDto['available_filters']>;

function hasVisibleMenuStatus(category: { menu_status?: number | string | null }): boolean {
  return category.menu_status === 1 || category.menu_status === '1';
}

export function mapAvailableFilters(dto: SearchProductsResponseDto['available_filters']): ProductAvailableFilters {
  const filters: AvailableFiltersDto = dto ?? {};

  return {
    colors: (filters.colors ?? []).map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
      productCount: color.product_count,
    })),
    variants: (filters.variants ?? []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      parentId: variant.parent_id,
      productCount: variant.product_count,
    })),
    properties: (filters.properties ?? []).map((property) => ({
      id: property.id,
      name: property.name,
      parentId: property.parent_id,
      parentName: property.parent_name,
      productCount: property.product_count,
    })),
    priceRanges: (filters.price_ranges ?? []).map((range) => ({
      label: range.label,
      min: range.min,
      max: range.max,
    })),
    productCategories: (filters.product_categories ?? []).filter(hasVisibleMenuStatus).map(mapFilterCategory),
    categoryChildren: (filters.category_children ?? []).map(mapFilterCategory),
    useProductCategoryFilters: Boolean(filters.use_product_category_filters),
  };
}

function mapFilterCategory(category: {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
  parent_id?: number | null;
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category.product_count,
    parentId: category.parent_id ?? null,
  };
}

export function mapProductDto(dto: ProductDto): Product {
  return {
    badge: dto.badge,
    brand: dto.brand_name,
    category: dto.category_name,
    currency: dto.currency_code,
    description: dto.description_text,
    id: dto.id,
    imageUrl: dto.image_url,
    originalPrice: dto.original_price ? parseSafely(dto.original_price) : undefined,
    price: parseSafely(dto.price),
    rating: parseSafely(dto.rating),
    reviewCount: parseSafely(dto.review_count),
    sellerName: dto.seller_name,
    shippingLabel: dto.shipping_label,
    slug: dto.slug,
    title: dto.title,
  };
}

export function mapPopularProductDto(dto: PopularProductDto): PopularProduct {
  return {
    id: String(dto.id),
    name: dto.name,
    slug: dto.slug,
    imageUrl: resolveCdnUrl(dto.image),
    price: dto.price,
  };
}

export function mapProductDetailReviewDto(review: Partial<ProductReviewDto> & {
  user?: { name?: string; surname?: string };
}): ProductReview {
  return {
    id: String(review.id),
    rating: parseSafely(review.rating, 5),
    comment: review.comment || '',
    photo: getOptionalImageUrl(review.photo),
    userName: review.user_name || review.user?.name || 'Kullanıcı',
    userSurname: review.user?.surname,
    createdAt: review.created_at || '',
  };
}

export function mergeProductDetailReviewPage(
  product: Product,
  reviewPage: ProductReviewPageDto | null | undefined,
): Product {
  const reviewDtos = reviewPage?.reviews?.data;
  if (!Array.isArray(reviewDtos) || reviewDtos.length === 0) return product;

  return {
    ...product,
    rating: parseSafely(reviewPage?.review_summary?.average, product.rating),
    reviewCount: parseSafely(reviewPage?.review_summary?.total, product.reviewCount),
    reviews: reviewDtos.map(mapProductDetailReviewDto),
  };
}

export function mapSearchProductDto(dto: SearchProductDto): Product {
  const rawImage =
    dto.image_urls?.medium ||
    dto.image_urls?.thumb ||
    dto.image_urls?.large ||
    dto.media?.medium ||
    dto.media?.thumb ||
    dto.media?.large ||
    null;

  let imagesList: string[] = [];
  if (Array.isArray(dto.medias)) {
    imagesList = dto.medias.map((m) => getImageUrl(m.medium || m.thumb || m.large)).filter(Boolean);
  }
  if (imagesList.length === 0) {
    imagesList = [getImageUrl(rawImage)];
  }

  const otherColorsMapped = extractOtherColors(dto).map((color) => {
    return {
      id: String(color.id),
      name: color.name || '',
      slug: color.slug || '',
      imageUrl: getImageUrl(getColorImagePath(color)),
      price: parseSafely(color.price),
    };
  });

  const featureIconsMapped = mapFeatureIconDtos(dto.feature_icons);


  return {
    badge: dto.badge,
    brand: dto.brand_name || 'HaydiGiy',
    category: dto.category_names?.[0] || 'Giyim',
    color: extractColorName(dto),
    currency: 'TRY',
    description: dto.description_text || '',
    id: String(dto.id),
    imageUrl: getImageUrl(rawImage),
    originalPrice: dto.max_price ? parseSafely(dto.max_price) : undefined,
    price: parseSafely(dto.price),
    rating: parseSafely(dto.average_rating),
    reviewCount: parseSafely(dto.reviews_count),
    sellerName: dto.seller_name || 'HaydiGiy',
    shippingLabel: dto.shipping_label || '',
    slug: dto.slug,
    title: dto.name,
    sizes: extractSizes(dto),
    hasStock: dto.has_stock ?? true,
    images: imagesList,
    otherColors: otherColorsMapped,
    videoPath: dto.video_path ? getImageUrl(dto.video_path) : null,
    featureIcons: featureIconsMapped,
  };
}

function extractSizes(dto: SearchProductDto): ProductSize[] {
  let sizesList: ProductSize[] = [];
  if (Array.isArray(dto.stock_variants)) {
    sizesList = dto.stock_variants.map((v) => ({
      name: v.name,
      hasStock: parseSafely(v.quantity) > 0,
    }));
  } else if (Array.isArray(dto.variant_names)) {
    sizesList = dto.variant_names.map((name) => ({
      name,
      hasStock: true,
    }));
  } else if (Array.isArray(dto.variants)) {
    sizesList = dto.variants
      .filter((v) => Boolean(v.name))
      .map((v) => ({
        name: v.name,
        hasStock: true,
      }));
  }

  const sizeOrder: Record<string, number> = {
    XXS: 0,
    XS: 1,
    S: 2,
    'S-M': 2.5,
    M: 3,
    L: 4,
    'L-XL': 4.5,
    XL: 5,
    XXL: 6,
    '2XL': 6,
    '2XL-3XL': 6.5,
    XXXL: 7,
    '3XL': 7,
    '3XL-4XL': 7.5,
    '4XL': 8,
    '5XL': 9,
  };

  return [...sizesList].sort((a, b) => {
    const nameA = String(a.name || '').trim().toUpperCase();
    const nameB = String(b.name || '').trim().toUpperCase();
    const orderA = sizeOrder[nameA];
    const orderB = sizeOrder[nameB];
    if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    const numA = parseInt(nameA.replace(/\D/g, '')) || 0;
    const numB = parseInt(nameB.replace(/\D/g, '')) || 0;
    if (numA !== 0 && numB !== 0) return numA - numB;
    return nameA.localeCompare(nameB, 'tr-TR');
  });
}

/**
 * Ölçünün adı `parent_name`de gelir; yoksa `property_name`e düşülür. Anahtar ADdan
 * üretilir: `property_id` ölçünün değerine ait olduğu için ("Genişlik" S bedeninde
 * 3173, L bedeninde 404) id ile gruplamak aynı ölçüden iki kolon üretiyordu.
 */
function mapSizeMeasurementEntry(dto: ProductSizeMeasurementPropertyDto): SizeMeasurementEntry | null {
  const name = (dto?.parent_name || dto?.property_name || '').trim();
  const value = (dto?.value || dto?.property_name || '').trim();
  if (!name || !value) return null;
  return { key: name.toLocaleLowerCase('tr-TR'), name, value };
}

/**
 * Beden bazlı ölçüleri (`size_measurements`) domain modeline çevirir. Ölçüsü
 * olmayan bedenler düşürülür; ekranda boş satır oluşmaz.
 */
export function mapSizeMeasurements(dtos: ProductSizeMeasurementDto[] | null | undefined): SizeMeasurement[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.flatMap((dto) => {
    const measurements = (dto?.properties ?? []).flatMap((property) => {
      const entry = mapSizeMeasurementEntry(property);
      return entry ? [entry] : [];
    });
    if (measurements.length === 0) return [];
    return [{ sizeName: (dto?.size_name || '').trim(), measurements }];
  });
}

export function mapProductDetailDto(dto: any): Product {
  const rawImage =
    dto.medias?.[0]?.medium ||
    dto.image_urls?.medium ||
    dto.image_url ||
    null;

  const imagesList = Array.isArray(dto.medias)
    ? dto.medias.map((m: any) => getImageUrl(m.medium || m.thumb || m.large)).filter(Boolean)
    : [getImageUrl(rawImage)];

  const otherColorsMapped = Array.isArray(dto.other_colors)
    ? dto.other_colors.map((color: any) => ({
        id: String(color.id),
        name: color.name || '',
        slug: color.slug || '',
        imageUrl: getImageUrl(color.media?.thumb || color.media?.medium || color.media?.large),
        price: parseSafely(color.price),
        isStock: color.is_stock ?? true,
      }))
    : [];

  const variantsMapped = Array.isArray(dto.variants)
    ? dto.variants.map((v: any) => ({
        id: String(v.id),
        name: v.name,
        name2: v.name_2,
        quantity: parseSafely(v.pivot?.quantity || v.quantity),
        price: parseSafely(v.pivot?.price || v.price),
        hasStock: parseSafely(v.pivot?.quantity || v.quantity) > 0,
        pivotId: v.pivot?.id != null ? String(v.pivot.id) : String(v.id),
      }))
    : [];

  const reviewsMapped = Array.isArray(dto.reviews)
    ? dto.reviews.map(mapProductDetailReviewDto)
    : [];

  const questionsMapped = Array.isArray(dto.questions)
    ? dto.questions.map((q: any) => ({
        id: String(q.id),
        question: q.question || '',
        reply: typeof q.reply === 'object' && q.reply !== null ? q.reply.reply : q.reply,
        userName: q.user_name || q.user?.name || 'Kullanıcı',
        createdAt: q.created_at || '',
      }))
    : [];

  const similarProductsMapped = Array.isArray(dto.similar_products)
    ? dto.similar_products.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        price: parseSafely(p.price),
        imageUrl: getImageUrl(p.media?.thumb || p.media?.medium || p.media?.large),
        hasStock: p.is_stock ?? true,
      }))
    : [];

  const propertiesMapped = Array.isArray(dto.properties)
    ? dto.properties.map((p: any) => ({
        name: p.parent?.name || '',
        value: p.name || '',
      }))
    : [];

  const featureIconsMapped = mapFeatureIconDtos(dto.feature_icons);

  // Bundle: paket kalemleri ve fiyat özeti. Normal üründe `is_bundle` gelmez ve
  // bu alanlar undefined kalır, dolayısıyla mevcut akış hiç değişmez.
  const isBundle = dto.is_bundle === true;
  const isApprovedForSale = dto.is_approved_for_sale === undefined ? true : Number(dto.is_approved_for_sale) === 1;
  const bundleItems = isBundle ? mapBundleItems(dto.bundle) : undefined;
  const bundleSummary = isBundle
    ? mapBundleSummary(bundleItems ?? [], dto.bundle, { isApprovedForSale })
    : undefined;

  return {
    badge: dto.badge,
    brand: dto.brand_name || 'HaydiGiy',
    category: dto.category?.name || 'Giyim',
    categorySlug: dto.category?.slug,
    categoryId: dto.category?.id,
    color: extractColorName(dto),
    currency: 'TRY',
    description: dto.description || '',
    id: String(dto.id),
    imageUrl: getImageUrl(rawImage),
    originalPrice: dto.other_price ? parseSafely(dto.other_price) : undefined,
    price: parseSafely(dto.price),
    rating: parseSafely(dto.average_rating || (dto.reviews?.length ? dto.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / dto.reviews.length : 0)),
    reviewCount: parseSafely(dto.reviews_count || dto.reviews?.length || 0),
    questionsCount: parseSafely(dto.questions_count ?? questionsMapped.length),
    sellerName: dto.supplier?.name || 'HaydiGiy',
    shippingLabel: dto.shipping_label || (dto.feature_icons?.[0]?.name ? dto.feature_icons[0].name : ''),
    slug: dto.slug,
    title: dto.name,
    sizes: variantsMapped.map((v: any) => ({ name: v.name, hasStock: v.hasStock })),
    hasStock: dto.is_stock ?? true,
    images: imagesList,
    otherColors: otherColorsMapped,
    videoPath: dto.video_path ? getImageUrl(dto.video_path) : null,
    featureIcons: featureIconsMapped,
    variants: variantsMapped,
    reviews: reviewsMapped,
    questions: questionsMapped,
    similarProducts: similarProductsMapped,
    stockCode: dto.stock_code,
    cartCount: dto.cart_count,
    favoritesCount: dto.favorites_count,
    totalQuantity: dto.total_quantity,
    isApprovedForSale,
    isBundle,
    bundleItems,
    bundleSummary,
    properties: propertiesMapped,
    sizeMeasurements: mapSizeMeasurements(dto.size_measurements),
    model: dto.model ? {
      height: dto.model.height,
      weight: dto.model.weight,
      chest: dto.model.chest,
      waist: dto.model.waist,
      hip: dto.model.hip,
      model_body: dto.model.model_body,
    } : null,
    variantOnModel: dto.variant_on_model ? {
      name: dto.variant_on_model.name,
    } : null,
  };
}
