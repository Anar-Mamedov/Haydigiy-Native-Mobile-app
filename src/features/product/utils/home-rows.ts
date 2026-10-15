import {
  BannerContent,
  HeadingContent,
  ProductShowcaseContent,
  Section,
  StoryContent,
  TextContent,
} from '@/types/page-design.types';
import { mapProductShowcaseContent } from '../api/product-showcase.mapper';
import { HOME_SECTION_GAP } from './home-layout';

/** Web mobil ana sayfasındaki 12 kolonlu CSS ızgarası. */
const GRID_COLUMNS = 12;

/** Ana sayfanın bir satırı: tam genişlikte tek bölüm ya da yan yana dizilen bannerlar. */
export type HomeRow = {
  key: string;
  sections: Section[];
};

/** Bölümün ızgarada kapladığı kolon sayısı; yalnızca bannerlar daha dar olabilir. */
export function getHomeSectionSpan(section: Section): number {
  return section.type === 'banner' ? (section.width_ratio ?? GRID_COLUMNS) : GRID_COLUMNS;
}

/** `span` kolonluk bölümün, `containerWidth` genişliğindeki satırda aldığı genişlik (aradaki boşluklar düşülür). */
export function getHomeSectionWidth(span: number, containerWidth: number): number {
  return (span / GRID_COLUMNS) * containerWidth - ((GRID_COLUMNS - span) / GRID_COLUMNS) * HOME_SECTION_GAP;
}

/** Satır, tam genişlikte tek bir bölümden mi oluşuyor (yan yana yerleşim gerekmiyor). */
export function isFullWidthHomeRow(row: HomeRow): boolean {
  return row.sections.length === 1 && getHomeSectionSpan(row.sections[0]) === GRID_COLUMNS;
}

/**
 * Bölüm ekranda bir şey çizecek mi. Sanallaştırılmış listede boş bölüm de bir hücre ve satır
 * aralığı kaplar; eskiden `YStack gap` boş çocukları atladığı için aynı davranış burada korunur.
 * Bileşenlerin kendi boş durum korumaları yerinde kalır.
 */
export function hasHomeSectionContent(section: Section): boolean {
  switch (section.type) {
    case 'banner': {
      const content = section.content as BannerContent;
      const items = content.items && content.items.length > 0 ? content.items : [{ image: content.image }];
      return items.some((item) => Boolean(item.image));
    }
    case 'story':
    case 'slider':
      return ((section.content as StoryContent).items ?? []).length > 0;
    case 'heading':
      return Boolean((section.content as HeadingContent).text);
    case 'text':
      return ((section.content as TextContent).items ?? []).some((item) => Boolean(item.text));
    case 'product_showcase':
      return mapProductShowcaseContent(section.content as ProductShowcaseContent).products.length > 0;
    default:
      return false;
  }
}

/**
 * Sayfa tasarımının etkin bölümlerini sırasıyla satırlara böler (web mobil ızgarasıyla aynı):
 * kolon toplamı 12'yi aşan bölüm yeni satıra geçer. Izgara konumları boş bölümler dahil
 * hesaplanır (yan yana bannerların yeri değişmesin); hiçbir şey çizmeyecek satırlar sonra atılır.
 */
export function buildHomeRows(sections: Section[] | null | undefined): HomeRow[] {
  const activeSections = [...(sections ?? [])]
    .filter((section) => section.status)
    .sort((a, b) => a.order - b.order);

  const rows: Section[][] = [];
  let currentRow: Section[] = [];
  let currentSpan = 0;

  activeSections.forEach((section) => {
    const span = getHomeSectionSpan(section);

    if (currentSpan + span > GRID_COLUMNS && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }

    currentRow.push(section);
    currentSpan += span;
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows
    .filter((rowSections) => rowSections.some(hasHomeSectionContent))
    .map((rowSections) => ({
      key: rowSections.map((section) => section.id).join('-'),
      sections: rowSections,
    }));
}
