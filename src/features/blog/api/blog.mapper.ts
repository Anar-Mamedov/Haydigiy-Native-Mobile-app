import type {
  BlogCategoryDto,
  BlogFaqDto,
  BlogPostDto,
  BlogPostListResponseDto,
  BlogRelatedProductDto,
} from '@/services/blog.service';
import { resolveCdnUrl } from '@/utils/cdn';
import {
  BlogCategory,
  BlogContentBlock,
  BlogFaq,
  BlogPost,
  BlogPostPage,
  BlogPostSummary,
  BlogRelatedProduct,
} from '../types/blog.types';
import { blogInlineText, parseBlogContent } from '../utils/blog-html';
import { parseBlogPrice, productSlugFromUrl } from '../utils/blog-product';
import { slugifyBlogCategory } from '../utils/blog-slug';

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {};

/** İlk dolu değeri metin olarak döndürür; web `readString` ile aynı öncelik kuralı. */
function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  }
  return '';
}

const readBoolean = (value: unknown): boolean => value === true || value === 1 || value === '1';

function readNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback;
}

/** Kategori dizisi düz metin veya nesne gelebiliyor; ikisi de başlığa indirgenir. */
function readLabels(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return readString(item);
      const record = asRecord(item);
      return readString(record.title, record.name, record.slug);
    })
    .filter(Boolean);
}

export function mapBlogCategory(dto: BlogCategoryDto | null | undefined): BlogCategory | null {
  const record = asRecord(dto);
  const title = readString(record.title, record.name);
  if (!title) return null;

  return {
    id: readString(record.id),
    title,
    slug: readString(record.slug) || slugifyBlogCategory(title),
  };
}

/** Aktif kategoriler; aynı slug iki kez gelirse sekmede tek görünür. */
export function mapBlogCategories(dtos: BlogCategoryDto[]): BlogCategory[] {
  const seen = new Set<string>();
  return dtos
    .map(mapBlogCategory)
    .filter((category): category is BlogCategory => {
      if (!category || seen.has(category.slug)) return false;
      seen.add(category.slug);
      return true;
    });
}

function mapRelatedProduct(dto: BlogRelatedProductDto): BlogRelatedProduct | null {
  const record = asRecord(dto);
  const name = readString(record.name, record.title);
  const slug = productSlugFromUrl(readString(record.url));
  if (!name || !slug) return null;

  return {
    id: readString(record.id),
    name,
    priceLabel: readString(record.price),
    price: parseBlogPrice(record.price as string | number | null | undefined),
    slug,
    imageUrl: resolveCdnUrl(readString(record.image)),
  };
}

function mapFaqs(value: BlogFaqDto[] | null | undefined): BlogFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const faq = asRecord(item);
      return { question: readString(faq.question), answer: readString(faq.answer) };
    })
    .filter((faq) => faq.question && faq.answer);
}

const normalizeTitle = (value: string) => value.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

/**
 * İçerik çoğunlukla yazı başlığıyla aynı bir `<h1>` ile başlıyor; ekranda başlık
 * zaten gösterildiği için bu tekrar atlanır.
 */
function dropRepeatedTitle(blocks: BlogContentBlock[], title: string): BlogContentBlock[] {
  const [first, ...rest] = blocks;
  if (first?.type === 'heading' && normalizeTitle(blogInlineText(first.children)) === normalizeTitle(title)) {
    return rest;
  }
  return blocks;
}

export function mapBlogPostSummary(dto: BlogPostDto): BlogPostSummary {
  const record = asRecord(dto);
  const category = mapBlogCategory(record.category as BlogCategoryDto | undefined);
  const labels = readLabels(record.categories);

  return {
    id: readString(record.id),
    slug: readString(record.slug, record.id),
    title: readString(record.title),
    excerpt: readString(record.excerpt, record.summary),
    coverImage: resolveCdnUrl(readString(record.cover_image, record.mainImage, record.coverImage)),
    coverImageAlt: readString(record.cover_image_alt, record.coverImageAlt, record.title),
    categoryTitle: category?.title ?? labels[0] ?? null,
    categorySlug: category?.slug ?? null,
    publishedAt: readString(record.publishedAt, record.published_at, record.created_at),
    isHighlighted:
      readBoolean(record.is_pinned ?? record.isPinned) ||
      readBoolean(record.is_featured ?? record.isFeatured),
  };
}

export function mapBlogPost(dto: BlogPostDto): BlogPost {
  const record = asRecord(dto);
  const summary = mapBlogPostSummary(dto);
  const relatedProducts = (
    (Array.isArray(record.relatedProducts) ? record.relatedProducts : record.related_products) ?? []
  ) as BlogRelatedProductDto[];

  return {
    ...summary,
    answerSummary: readString(
      record.answer_summary,
      record.answerSummary,
      record.tldr,
      record.excerpt,
    ),
    contentBlocks: dropRepeatedTitle(parseBlogContent(readString(record.content)), summary.title),
    tags: readLabels(record.tags),
    faqs: mapFaqs(record.faqs as BlogFaqDto[] | undefined),
    relatedProducts: Array.isArray(relatedProducts)
      ? relatedProducts
          .map(mapRelatedProduct)
          .filter((product): product is BlogRelatedProduct => product !== null)
      : [],
  };
}

export function mapBlogPostPage(response: BlogPostListResponseDto): BlogPostPage {
  const posts = (Array.isArray(response.data) ? response.data : [])
    .map(mapBlogPostSummary)
    .filter((post) => post.slug && post.title);
  const pagination = asRecord(response.pagination);
  const currentPage = readNumber(pagination.current_page, 1);

  return {
    posts,
    currentPage,
    lastPage: readNumber(pagination.last_page, currentPage),
    total: readNumber(pagination.total, posts.length),
  };
}
