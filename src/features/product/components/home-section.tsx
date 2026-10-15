import {
  BannerContent,
  HeadingContent,
  ProductShowcaseContent,
  Section,
  StoryContent,
  TextContent,
} from '@/types/page-design.types';
import { HomeBannerSection } from './home-banner-section';
import { HomeHeadingSection } from './home-heading-section';
import { HomeProductShowcase } from './home-product-showcase';
import { HomeSliderSection } from './home-slider-section';
import { HomeStorySection } from './home-story-section';
import { HomeTextSection } from './home-text-section';

type HomeSectionProps = {
  section: Section;
  /** Bölümün satırda kapladığı genişlik (px). */
  width: number;
};

/**
 * Sayfa tasarımındaki tek bir bölümü türüne göre çizer.
 *
 * Liste hücreleri yeniden kullanıldığında yerel durum tutan bölümler (vitrinin hızlı sepet
 * durumu ve kaydırma konumu, slider'ın etkin slaytı ve zamanlayıcısı, hikâye rafının konumu)
 * bölüm kimliğiyle anahtarlanır; başka bir bölüme geçen hücre bu durumu taşımaz. Banner'lar
 * durumlarını görsel adresine bağladığı için anahtarsız yeniden kullanılır.
 */
export function HomeSection({ section, width }: HomeSectionProps) {
  switch (section.type) {
    case 'story':
      return <HomeStorySection content={section.content as StoryContent} key={section.id} />;
    case 'slider':
      return <HomeSliderSection content={section.content as StoryContent} key={section.id} />;
    case 'banner':
      return <HomeBannerSection content={section.content as BannerContent} width={width} />;
    case 'heading':
      return <HomeHeadingSection content={section.content as HeadingContent} />;
    case 'text':
      return <HomeTextSection content={section.content as TextContent} />;
    case 'product_showcase':
      return <HomeProductShowcase content={section.content as ProductShowcaseContent} key={section.id} />;
    default:
      return null;
  }
}
