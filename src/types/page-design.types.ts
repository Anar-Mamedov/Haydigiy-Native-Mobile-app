export interface StoryItem {
  link?: string;
  image?: string;
  title?: string;
  extra_link?: string;
  text?: string;
  alt_text?: string;
}

export interface BannerItem {
  id?: number;
  image?: string;
  link?: string | null;
  text?: string | null;
  alt_text?: string | null;
}

export interface BannerContent {
  items?: BannerItem[];
  link?: string | null; // legacy single banner
  text?: string | null;
  image?: string; // legacy single banner
  button_text?: string | null;
  width_ratio?: number;
}

export interface StoryContent {
  items: StoryItem[];
  story_shape?: 'circle' | 'square';
  story_title?: string;
}

export interface HeadingContent {
  text: string;
}

export interface TextItem {
  text?: string;
  link?: string | null;
}

export interface TextContent {
  items?: TextItem[];
}

/** Vitrin ürünü; backend fiyatı biçimli metin ("₺219,99") olarak da gönderebilir. */
export interface ProductShowcaseProductItem {
  id?: number | string;
  name?: string;
  title?: string;
  price?: string | number;
  first_price?: string | number;
  has_discount?: boolean;
  discount_rate?: number;
  url?: string;
  link?: string;
  image?: string;
  is_pinned?: boolean;
}

/** Eski panel kayıtlarında başlık ve ürünler `items[0]` içinde gelir. */
export interface ProductShowcaseLegacyItem {
  text?: string;
  subtitle?: string;
  button_text?: string;
  link?: string;
  products?: ProductShowcaseProductItem[];
}

export interface ProductShowcaseContent {
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  link?: string;
  items?: ProductShowcaseLegacyItem[];
  products?: ProductShowcaseProductItem[];
}

export interface Section {
  id: number;
  page_design_id: number;
  order: number;
  type: 'banner' | 'story' | 'heading' | 'text' | 'slider' | 'product_showcase';
  content: BannerContent | StoryContent | HeadingContent | TextContent | ProductShowcaseContent;
  margins: Record<string, unknown>[] | null;
  status: boolean;
  width_ratio: number | null;
  created_at: string;
  updated_at: string;
}

export interface PageDesign {
  id: number;
  name: string;
  device: string;
  sections: Section[];
}
