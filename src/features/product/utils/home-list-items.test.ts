import { Section } from '@/types/page-design.types';
import { buildHomeListItems, getHomeListItemType } from './home-list-items';
import { HomeRow } from './home-rows';

const section = (id: number, type: Section['type']): Section => ({
  content: { items: [] },
  created_at: '',
  id,
  margins: null,
  order: id,
  page_design_id: 1,
  status: true,
  type,
  updated_at: '',
  width_ratio: 12,
});

const row = (...sections: Section[]): HomeRow => ({
  key: sections.map((s) => s.id).join('-'),
  sections,
});

describe('buildHomeListItems', () => {
  it('lists the design rows followed by recommendations and the footer', () => {
    const items = buildHomeListItems([row(section(1, 'banner')), row(section(2, 'banner'), section(3, 'banner'))]);

    expect(items.map((item) => item.key)).toEqual(['row-1', 'row-2-3', 'recommendations', 'footer']);
  });

  it('still shows recommendations and the footer without design rows', () => {
    expect(buildHomeListItems([]).map((item) => item.kind)).toEqual(['recommendations', 'footer']);
  });
});

describe('getHomeListItemType', () => {
  it('recycles full-width rows only with rows of the same section type', () => {
    const [banner, showcase, pair, recommendations, footer] = buildHomeListItems([
      row(section(1, 'banner')),
      row(section(2, 'product_showcase')),
      row(section(3, 'banner'), section(4, 'banner')),
    ]);

    expect(getHomeListItemType(banner)).toBe('section:banner');
    expect(getHomeListItemType(showcase)).toBe('section:product_showcase');
    expect(getHomeListItemType(pair)).toBe('section-row');
    expect(getHomeListItemType(recommendations)).toBe('recommendations');
    expect(getHomeListItemType(footer)).toBe('footer');
  });
});
