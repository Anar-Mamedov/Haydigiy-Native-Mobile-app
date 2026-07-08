export type ProductSize = {
  name: string;
  hasStock: boolean;
};

export type FeatureIcon = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  descriptionBgColor?: string | null;
  assetUrl: string;
  positionHint?: string | null;
  displayOrder?: number | null;
  sortOrder?: number | null;
  position?: string | null;
};

export type FilterColor = {
  id: number;
  name: string;
  hex: string | null;
  productCount?: number;
};

export type FilterVariant = {
  id: number;
  name: string;
  parentId?: number;
  productCount?: number;
};

export type FilterProperty = {
  id: number;
  name: string;
  parentId: number | null;
  parentName: string | null;
  productCount?: number;
};

export type FilterPriceRange = {
  label: string;
  min: number;
  max: number | null;
};

export type FilterCategory = {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
  parentId?: number | null;
};

export type ProductAvailableFilters = {
  colors: FilterColor[];
  variants: FilterVariant[];
  properties: FilterProperty[];
  priceRanges: FilterPriceRange[];
  productCategories: FilterCategory[];
  categoryChildren: FilterCategory[];
  useProductCategoryFilters: boolean;
};

export type QuickFilterValue = {
  id: number;
  name: string;
};

/**
 * Curated per-category filter shortcut group (`/quick-filter/{categoryId}`),
 * e.g. "Yaka Tipi" with its values. Value ids are property ids and toggle the
 * same `property_ids` list as the full filter sheet.
 */
export type QuickFilterGroup = {
  id: number;
  name: string;
  values: QuickFilterValue[];
};

export type ProductReview = {
  id: string;
  rating: number;
  comment: string;
  photo?: string | null;
  userName: string;
  userSurname?: string;
  createdAt: string;
};

export type ProductQuestion = {
  id: string;
  question: string;
  reply?: string;
  userName: string;
  createdAt: string;
};

export type SimilarProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  hasStock: boolean;
};

/** A sibling color variant of a product (each color is its own product). */
export type ProductColorOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  isStock?: boolean;
};

export type PopularProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: number | null;
};

export type ProductVariant = {
  id: string;
  name: string;
  name2?: string | null;
  quantity: number;
  price: number;
  hasStock: boolean;
  /** Product-variant pivot id; this is the `variant_id` the cart API expects. */
  pivotId?: string;
};

export type ProductModel = {
  height?: string;
  weight?: string;
  chest?: string;
  waist?: string;
  hip?: string;
  model_body?: string;
};

export type ProductVariantOnModel = {
  name?: string;
};

export type Product = {
  badge?: string;
  brand: string;
  category: string;
  categories?: string[];
  categorySlug?: string;
  categoryId?: number;
  currency: 'TRY';
  description: string;
  id: string;
  imageUrl: string;
  originalPrice?: number;
  price: number;
  rating: number;
  reviewCount: number;
  /** Total Q&A count from the API (`questions_count`), not the embedded subset length. */
  questionsCount?: number;
  sellerName: string;
  shippingLabel: string;
  slug: string;
  title: string;
  is_favorite?: boolean;
  isFavorite?: boolean;
  sizes?: ProductSize[];
  hasStock?: boolean;
  images?: string[];
  otherColors?: ProductColorOption[];
  videoPath?: string | null;
  featureIcons?: FeatureIcon[];
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  questions?: ProductQuestion[];
  similarProducts?: SimilarProduct[];
  stockCode?: string;
  cartCount?: number;
  favoritesCount?: number;
  totalQuantity?: number;
  isApprovedForSale?: boolean;
  properties?: { name: string; value: string }[];
  model?: ProductModel | null;
  variantOnModel?: ProductVariantOnModel | null;
};
