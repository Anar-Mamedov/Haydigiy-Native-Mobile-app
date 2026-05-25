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

export interface Section {
  id: number;
  page_design_id: number;
  order: number;
  type: 'banner' | 'story' | 'heading' | 'text' | 'slider';
  content: BannerContent | StoryContent | HeadingContent | TextContent;
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
