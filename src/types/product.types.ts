export type ProductSize = {
  name: string;
  hasStock: boolean;
};

export type FeatureIcon = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  assetUrl: string;
  positionHint?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  displayOrder?: number;
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

export type Product = {
  badge?: string;
  brand: string;
  category: string;
  currency: 'TRY';
  description: string;
  id: string;
  imageUrl: string;
  originalPrice?: number;
  price: number;
  rating: number;
  reviewCount: number;
  sellerName: string;
  shippingLabel: string;
  slug: string;
  title: string;
  sizes?: ProductSize[];
  hasStock?: boolean;
  images?: string[];
  otherColors?: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
  }>;
  videoPath?: string | null;
  featureIcons?: FeatureIcon[];
};

