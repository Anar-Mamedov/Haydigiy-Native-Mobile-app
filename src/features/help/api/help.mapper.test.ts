import { mapHelpCategory } from './help.mapper';

describe('mapHelpCategory', () => {
  it('maps a category with its articles', () => {
    const result = mapHelpCategory({
      id: 3,
      title: 'İade ve Değişim',
      slug: 'iade-degisim',
      articles: [{ id: 10, question: 'Ne zaman?', answer: '3-5 iş günü.' }],
    });

    expect(result).toEqual({
      id: 3,
      title: 'İade ve Değişim',
      slug: 'iade-degisim',
      articles: [{ id: 10, question: 'Ne zaman?', answer: '3-5 iş günü.' }],
    });
  });

  it('defaults to an empty article list when articles are missing', () => {
    const result = mapHelpCategory({ id: 1, title: 'Genel' });
    expect(result.articles).toEqual([]);
    expect(result.slug).toBeUndefined();
  });
});
