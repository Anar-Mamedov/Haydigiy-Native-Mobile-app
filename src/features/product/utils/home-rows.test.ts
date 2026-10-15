import { Section } from '@/types/page-design.types';
import {
  buildHomeRows,
  getHomeSectionWidth,
  hasHomeSectionContent,
  isFullWidthHomeRow,
} from './home-rows';

let nextId = 1;

const section = (overrides: Partial<Section>): Section => {
  const id = overrides.id ?? nextId++;
  return {
    content: { items: [{ image: `https://cdn.haydigiy.com/banners/${id}.webp` }] },
    created_at: '',
    id,
    margins: null,
    order: id,
    page_design_id: 1,
    status: true,
    type: 'banner',
    updated_at: '',
    width_ratio: 12,
    ...overrides,
  };
};

const rowIds = (sections: Section[]) => buildHomeRows(sections).map((row) => row.sections.map((s) => s.id));

beforeEach(() => {
  nextId = 1;
});

describe('buildHomeRows', () => {
  it('pairs half-width banners and keeps full-width sections on their own row', () => {
    const sections = [
      section({ id: 1, order: 0 }),
      section({ id: 2, order: 1, width_ratio: 6 }),
      section({ id: 3, order: 2, width_ratio: 6 }),
      section({ id: 4, order: 3, width_ratio: 6 }),
      section({ content: { text: 'Başlık' }, id: 5, order: 4, type: 'heading', width_ratio: 6 }),
    ];

    expect(rowIds(sections)).toEqual([[1], [2, 3], [4], [5]]);
  });

  it('sorts by order and skips inactive sections', () => {
    const sections = [
      section({ id: 1, order: 5 }),
      section({ id: 2, order: 1 }),
      section({ id: 3, order: 3, status: false }),
    ];

    expect(rowIds(sections)).toEqual([[2], [1]]);
  });

  it('keeps grid positions of empty sections but drops rows that draw nothing', () => {
    const sections = [
      section({ content: { items: [{ image: '' }] }, id: 1, order: 0, width_ratio: 6 }),
      section({ id: 2, order: 1, width_ratio: 6 }),
      section({ content: { text: '' }, id: 3, order: 2, type: 'heading' }),
      section({ id: 4, order: 3 }),
    ];

    // Banner 2 stays in the right half next to the empty banner 1, as on the web.
    expect(rowIds(sections)).toEqual([[1, 2], [4]]);
  });

  it('builds stable row keys from section ids', () => {
    const rows = buildHomeRows([
      section({ id: 7, order: 0, width_ratio: 6 }),
      section({ id: 8, order: 1, width_ratio: 6 }),
    ]);

    expect(rows[0].key).toBe('7-8');
  });

  it('returns no rows without a design', () => {
    expect(buildHomeRows(undefined)).toEqual([]);
  });
});

describe('isFullWidthHomeRow', () => {
  it('is true only for a single 12-column section', () => {
    expect(isFullWidthHomeRow({ key: '1', sections: [section({})] })).toBe(true);
    expect(isFullWidthHomeRow({ key: '1', sections: [section({ width_ratio: 6 })] })).toBe(false);
    expect(isFullWidthHomeRow({ key: '1', sections: [section({ type: 'slider', width_ratio: 6 })] })).toBe(true);
  });
});

describe('getHomeSectionWidth', () => {
  it('splits the row and subtracts the shared gap', () => {
    expect(getHomeSectionWidth(12, 370)).toBe(370);
    expect(getHomeSectionWidth(6, 370)).toBe(182.5);
  });
});

describe('hasHomeSectionContent', () => {
  it('detects legacy single-image banners', () => {
    expect(hasHomeSectionContent(section({ content: { image: 'https://cdn.haydigiy.com/a.webp' } }))).toBe(true);
    expect(hasHomeSectionContent(section({ content: { items: [] } }))).toBe(false);
  });

  it('treats a showcase without openable products as empty', () => {
    const showcase = (products: unknown[]) =>
      section({ content: { products } as Section['content'], type: 'product_showcase' });

    expect(hasHomeSectionContent(showcase([{ id: 5, image: 'x', name: 'Bluz' }]))).toBe(true);
    expect(hasHomeSectionContent(showcase([{ name: 'Kimliksiz' }]))).toBe(false);
  });

  it('checks stories, sliders and text links', () => {
    expect(hasHomeSectionContent(section({ content: { items: [{ image: 'a' }] }, type: 'story' }))).toBe(true);
    expect(hasHomeSectionContent(section({ content: { items: [] }, type: 'slider' }))).toBe(false);
    expect(hasHomeSectionContent(section({ content: { items: [{ text: '' }] }, type: 'text' }))).toBe(false);
    expect(hasHomeSectionContent(section({ content: { items: [{ text: 'İade' }] }, type: 'text' }))).toBe(true);
  });
});
