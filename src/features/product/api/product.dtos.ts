export type ProductDto = {
  badge?: string;
  brand_name: string;
  category_name: string;
  currency_code: 'TRY';
  description_text: string;
  id: string;
  image_url: string;
  original_price?: number;
  price: number;
  rating: number;
  review_count: number;
  seller_name: string;
  shipping_label: string;
  slug: string;
  title: string;
};

export type SearchProductColorDto = {
  id: number;
  name?: string;
  slug?: string;
  price?: number | string;
  image?: {
    thumb?: string;
    medium?: string;
    large?: string;
  };
  media?: {
    id?: number;
    thumb?: string;
    medium?: string;
    large?: string;
    product_id?: number;
    path?: {
      thumb?: string;
      medium?: string;
      large?: string;
    };
  };
};

export interface SearchProductDto {
  id: number;
  name: string;
  slug: string;
  price: number;
  max_price?: number;
  price_range?: {
    min: number;
    max: number;
  };
  average_rating: number;
  reviews_count: number;
  image_urls?: {
    thumb: string;
    medium: string;
    large: string;
  };
  media?: {
    id: number;
    thumb?: string;
    medium?: string;
    large?: string;
    path?: {
      thumb: string;
      medium: string;
      large: string;
    };
  };
  category_names?: string[];
  category_slugs?: string[];
  category_ids?: number[];
  brand_name?: string;
  has_stock?: boolean;
  shipping_label?: string;
  badge?: string;
  seller_name?: string;
  description_text?: string;
  stock_variants?: {
    id: number;
    name: string;
    quantity: string | number;
    price: number;
  }[];
  variant_names?: string[];
  variants?: {
    id: number;
    name: string;
    parent_id?: number;
    name_2?: string | null;
  }[];
  medias?: {
    id: number;
    thumb?: string;
    medium?: string;
    large?: string;
  }[];
  other_colors?: SearchProductColorDto[] | {
    data?: SearchProductColorDto[];
    total_count?: number;
  };
  video_path?: string | null;
}

export interface SearchProductsResponseDto {
  data?: SearchProductDto[];
  products?: {
    data?: SearchProductDto[];
    current_page?: number;
    last_page?: number;
    total?: number;
    per_page?: number;
  } | SearchProductDto[];
  category?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    seo_title: string;
    seo_description: string;
    children?: {
      id: number;
      parent_id: number;
      name: string;
      slug: string;
    }[];
  };
  available_filters?: {
    colors?: {
      id: number;
      name: string;
      hex: string | null;
      product_count?: number;
      image?: {
        thumb?: string;
        medium?: string;
        large?: string;
      };
    }[];
    variants?: { id: number; name: string; parent_id: number; product_count?: number }[];
    properties?: {
      id: number;
      name: string;
      parent_id: number | null;
      parent_name: string | null;
      product_count?: number;
    }[];
    price_range?: { min: number; max: number };
    price_ranges?: { label: string; min: number; max: number | null }[];
    product_categories?: {
      id: number;
      name: string;
      slug: string;
      product_count?: number;
      parent_id?: number | null;
    }[];
    category_children?: { id: number; name: string; slug: string; parent_id?: number | null }[];
    use_product_category_filters?: boolean;
  };
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
}

export interface SearchSuggestionProductDto {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface SearchSuggestionCategoryDto {
  id: number;
  name: string;
  slug: string;
}

export interface SearchSuggestionsResponseDto {
  products: SearchSuggestionProductDto[];
  categories: SearchSuggestionCategoryDto[];
}

export interface PopularProductDto {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number | null;
}
