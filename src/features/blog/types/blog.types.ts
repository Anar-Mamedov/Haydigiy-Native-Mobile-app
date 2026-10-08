/** Blog kategori sekmesi; `slug` API'nin `category_slug` filtresine gider. */
export type BlogCategory = {
  id: string;
  title: string;
  slug: string;
};

/** Yazının içinde geçen, ürün detayına açılan ürün. */
export type BlogRelatedProduct = {
  id: string;
  name: string;
  /** Backend'in hazır biçimlediği fiyat metni ("349,99 TL"); web de aynen gösteriyor. */
  priceLabel: string;
  /** Ürün detayının önizlemesi için sayıya çevrilmiş fiyat; çözülemezse 0. */
  price: number;
  /** Web ürün adresinin son segmenti; ürün detay rotası bununla açılır. */
  slug: string;
  imageUrl: string | null;
};

export type BlogFaq = {
  question: string;
  answer: string;
};

/** Liste kartlarının ihtiyaç duyduğu özet alanlar. */
export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverImageAlt: string;
  /** `category.title`, yoksa `categories[0]`; ikisi de yoksa `null`. */
  categoryTitle: string | null;
  /** Yalnızca backend kategori nesnesi döndüğünde dolu; kırıntı bağlantısı bununla kurulur. */
  categorySlug: string | null;
  publishedAt: string;
  /** Sabitlenmiş veya öne çıkarılmış yazı; listede manşet olarak gösterilir. */
  isHighlighted: boolean;
};

/** Satır içi metin parçası; kalın/italik/bağlantı işaretleri taşır. */
export type BlogInline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
};

export type BlogHeadingLevel = 2 | 3 | 4;

/**
 * Blog HTML'inin güvenli, yerel çizime uygun karşılığı. Ham HTML hiçbir zaman
 * çalıştırılmaz; yalnızca bu bloklara çevrilen metin ve doğrulanmış bağlantılar
 * ekrana gelir.
 */
export type BlogContentBlock =
  | { type: 'heading'; level: BlogHeadingLevel; children: BlogInline[] }
  | { type: 'paragraph'; children: BlogInline[] }
  | { type: 'quote'; children: BlogInline[] }
  | { type: 'list'; ordered: boolean; items: BlogInline[][] }
  | { type: 'image'; src: string; alt: string };

export type BlogPost = BlogPostSummary & {
  /** "Kısa Cevap" kutusu: `answer_summary`, `tldr`, `excerpt` sırasıyla; boşsa kutu gizlenir. */
  answerSummary: string;
  contentBlocks: BlogContentBlock[];
  tags: string[];
  faqs: BlogFaq[];
  relatedProducts: BlogRelatedProduct[];
};

export type BlogPostPage = {
  posts: BlogPostSummary[];
  currentPage: number;
  lastPage: number;
  total: number;
};
