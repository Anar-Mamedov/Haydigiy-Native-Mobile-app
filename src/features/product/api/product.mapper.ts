import { ProductDto, SearchProductColorDto, SearchProductDto, SearchProductsResponseDto } from '@/features/product/api/product.dtos';
import { getRequiredApiBaseUrl } from '@/lib/env';
import { Product, ProductAvailableFilters, ProductSize, FeatureIcon } from '@/types/product.types';

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

function resolveMediumImagePath(...paths: Array<string | null | undefined>): string | null {
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

type AvailableFiltersDto = NonNullable<SearchProductsResponseDto['available_filters']>;

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
    productCategories: (filters.product_categories ?? []).map(mapFilterCategory),
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

  let featureIconsMapped: FeatureIcon[] = [];
  if (Array.isArray((dto as any).feature_icons)) {
    featureIconsMapped = (dto as any).feature_icons.map((icon: any) => ({
      id: icon.id,
      name: icon.name || '',
      slug: icon.slug || '',
      description: icon.description,
      assetUrl: getImageUrl(icon.asset_url),
      positionHint: icon.position_hint,
      displayOrder: icon.pivot?.display_order,
      position: icon.pivot?.position,
    }));
  }

  return {
    badge: dto.badge,
    brand: dto.brand_name || 'HaydiGiy',
    category: dto.category_names?.[0] || 'Giyim',
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

