import { TabStrip } from '@/components/ui';
import { BlogCategory } from '../types/blog.types';
import { BLOG_ALL_CATEGORIES_KEY, BLOG_TEXTS } from '../constants/blog-ui';

type BlogCategoryTabsProps = {
  categories: BlogCategory[];
  /** Seçili kategorinin slug'ı ya da tüm yazılar için {@link BLOG_ALL_CATEGORIES_KEY}. */
  activeKey: string;
  /** Kategori slug'ı; "Tümü" için `null`. */
  onSelect: (categorySlug: string | null) => void;
};

/**
 * Blog kategorileri arasında geçiş şeridi. Web'de mobilde aynı liste bir menü
 * çekmecesinde ("Tümü" + kategoriler) duruyor; uygulamada diğer liste
 * ekranlarıyla tutarlı olsun diye kaydırılabilir sekmeler kullanılır.
 */
export function BlogCategoryTabs({ categories, activeKey, onSelect }: BlogCategoryTabsProps) {
  const tabs = [
    { key: BLOG_ALL_CATEGORIES_KEY, label: BLOG_TEXTS.allCategories },
    ...categories.map((category) => ({ key: category.slug, label: category.title })),
  ];

  return (
    <TabStrip
      activeKey={activeKey}
      onChange={(key) => onSelect(key === BLOG_ALL_CATEGORIES_KEY ? null : key)}
      tabs={tabs}
    />
  );
}
