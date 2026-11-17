import type { CategorySlugEntry, CategorySlugIndex } from '@/types/category-slug-index.types';
import type { CategoryTreeNodeDto } from './category-tree.dtos';

function toEntry(node: CategoryTreeNodeDto): CategorySlugEntry | null {
  const id = Number(node.id);
  const slug = typeof node.slug === 'string' ? node.slug.trim() : '';
  return Number.isSafeInteger(id) && id > 0 && slug ? { id, slug } : null;
}

/** Ağacı derinlemesine gezip id ve slug indekslerini kurar; geçersiz düğümler atlanır, alt dalları gezilir. */
export function mapCategorySlugIndex(nodes: CategoryTreeNodeDto[] | null | undefined): CategorySlugIndex {
  const byId = new Map<number, CategorySlugEntry>();
  const bySlug = new Map<string, CategorySlugEntry>();

  const visit = (list: CategoryTreeNodeDto[] | null | undefined) => {
    if (!Array.isArray(list)) return;
    for (const node of list) {
      if (!node) continue;
      const entry = toEntry(node);
      if (entry) {
        byId.set(entry.id, entry);
        if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, entry);
      }
      visit(node.children);
    }
  };

  visit(nodes);
  return { byId, bySlug };
}
