import { buildListingWebLocation } from './listing-web-location';

describe('buildListingWebLocation', () => {
  it('builds the web category address from slug and category id', () => {
    expect(buildListingWebLocation({ slug: 'kolye-kupe-bileklik', categoryId: 216 })).toEqual({
      path: '/kolye-kupe-bileklik',
      queryString: 'c=216',
    });
  });

  it('keeps the menu listing key and the search query encoded', () => {
    expect(buildListingWebLocation({ slug: 'cok-satanlar', menuUrl: 'cok-satanlar' })).toEqual({
      path: '/cok-satanlar',
      queryString: 'menu_url=cok-satanlar',
    });
    expect(buildListingWebLocation({ slug: 'search', searchQuery: 'siyah elbise' })).toEqual({
      path: '/search',
      queryString: 'q=siyah%20elbise',
    });
  });

  it('uses the supplier listing path as it is', () => {
    expect(buildListingWebLocation({ slug: 's/123' })).toEqual({ path: '/s/123', queryString: '' });
  });
});
