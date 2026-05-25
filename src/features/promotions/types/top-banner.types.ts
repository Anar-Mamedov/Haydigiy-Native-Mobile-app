export interface TopBannerData {
  id: number;
  title: string;
  type: 'text' | 'image';
  text: string | null;
  subtext: string | null;
  link: string | null;
  bg_color_from: string;
  bg_color_to: string;
  text_color: string;
  image_web: string | null;
  image_mobile: string | null;
  animation_type: 'none' | 'marquee' | 'fade';
  countdown_enabled: boolean;
  countdown_end_at: string | null;
  end_at: string | null;
  target_audience: 'all' | 'guest' | 'logged_in';
  pages: string[] | null;
  device: 'all' | 'web' | 'mobile';
  dismissible: boolean;
  priority: number;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
