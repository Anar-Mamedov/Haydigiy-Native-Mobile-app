/** Kategori ağacındaki bir kategorinin web adresini kuran alanlar (`/{slug}?c={id}`). */
export type CategorySlugEntry = {
  id: number;
  slug: string;
};

/**
 * Kategori ağacının id ve slug ile aranabilir hâli. Web `src/lib/seo/categorySlugMap.ts` ile aynı:
 * aynı slug birden çok kez geçerse ağaçta ilk görülen kazanır.
 */
export type CategorySlugIndex = {
  byId: ReadonlyMap<number, CategorySlugEntry>;
  bySlug: ReadonlyMap<string, CategorySlugEntry>;
};
