import { BlogPostDto } from '@/services/blog.service';
import { mapBlogCategories, mapBlogPost, mapBlogPostPage, mapBlogPostSummary } from './blog.mapper';

const postDto: BlogPostDto = {
  id: '25',
  slug: 'koruklu-cizme-kombin-rehberi',
  title: 'Kış Modasında İddialı Adımlar',
  excerpt: 'Körüklü çizmeleri keşfedin.',
  content:
    '<!-- Title Tag: Kış -->\n<h1>Kış Modasında  İddialı Adımlar</h1>\n<p>Giriş <strong>paragrafı</strong>.</p>',
  answer_summary: '',
  tldr: 'Kısa özet.',
  cover_image: 'https://cdn.haydigiy.com/uploads/cizme.webp',
  mainImage: 'https://cdn.haydigiy.com/uploads/other.webp',
  cover_image_alt: 'Körüklü çizme',
  is_featured: false,
  is_pinned: 1,
  publishedAt: '2026-10-01T12:46:28+03:00',
  category: { id: 3, name: 'Kombin', title: 'Kombin', slug: 'kombin' },
  categories: ['Kombin'],
  tags: ['Çizme', { title: 'Kış' }],
  faqs: [
    { question: 'Rahat mı?', answer: 'Evet.' },
    { question: 'Boş cevap', answer: '' },
  ],
  relatedProducts: [
    {
      id: 100098,
      name: '9 Cm Topuklu Körüklü Çizme',
      price: '849,99 TL',
      url: 'https://haydigiy.com/9-cm-topuklu-koruklu-cizme-siyahsuet-33772264-100098',
      image: 'https://cdn.haydigiy.com/uploads/c1.webp',
    },
    { id: 1, name: 'URL yok', price: '10 TL', url: '' },
  ],
};

describe('mapBlogPostSummary', () => {
  it('maps list fields with the web fallbacks', () => {
    expect(mapBlogPostSummary(postDto)).toEqual({
      id: '25',
      slug: 'koruklu-cizme-kombin-rehberi',
      title: 'Kış Modasında İddialı Adımlar',
      excerpt: 'Körüklü çizmeleri keşfedin.',
      coverImage: 'https://cdn.haydigiy.com/uploads/cizme.webp',
      coverImageAlt: 'Körüklü çizme',
      categoryTitle: 'Kombin',
      categorySlug: 'kombin',
      publishedAt: '2026-10-01T12:46:28+03:00',
      isHighlighted: true,
    });
  });

  it('falls back to categories[], slug from id and alternative image keys', () => {
    const summary = mapBlogPostSummary({
      id: 7,
      title: 'Başlık',
      summary: 'Özet',
      mainImage: 'uploads/a.webp',
      categories: [{ name: 'Trendler' }],
      published_at: '2026-01-01',
    });

    expect(summary).toMatchObject({
      id: '7',
      slug: '7',
      excerpt: 'Özet',
      coverImage: 'https://cdn.haydigiy.com/uploads/a.webp',
      coverImageAlt: 'Başlık',
      categoryTitle: 'Trendler',
      categorySlug: null,
      publishedAt: '2026-01-01',
      isHighlighted: false,
    });
  });
});

describe('mapBlogPost', () => {
  it('drops the repeated title heading and maps summary, tags, faqs and products', () => {
    const post = mapBlogPost(postDto);

    expect(post.answerSummary).toBe('Kısa özet.');
    expect(post.contentBlocks).toEqual([
      { type: 'paragraph', children: [{ text: 'Giriş ' }, { text: 'paragrafı', bold: true }, { text: '.' }] },
    ]);
    expect(post.tags).toEqual(['Çizme', 'Kış']);
    expect(post.faqs).toEqual([{ question: 'Rahat mı?', answer: 'Evet.' }]);
    expect(post.relatedProducts).toEqual([
      {
        id: '100098',
        name: '9 Cm Topuklu Körüklü Çizme',
        priceLabel: '849,99 TL',
        price: 849.99,
        slug: '9-cm-topuklu-koruklu-cizme-siyahsuet-33772264-100098',
        imageUrl: 'https://cdn.haydigiy.com/uploads/c1.webp',
      },
    ]);
  });

  it('reads snake_case related products and keeps a heading that differs from the title', () => {
    const post = mapBlogPost({
      id: '1',
      slug: 'a',
      title: 'Başlık',
      content: '<h2>Başka başlık</h2>',
      related_products: [{ id: 2, title: 'Ürün', url: '/urun-2', image: null }],
    });

    expect(post.answerSummary).toBe('');
    expect(post.contentBlocks).toEqual([{ type: 'heading', level: 2, children: [{ text: 'Başka başlık' }] }]);
    expect(post.relatedProducts).toEqual([
      { id: '2', name: 'Ürün', priceLabel: '', price: 0, slug: 'urun-2', imageUrl: null },
    ]);
  });
});

describe('mapBlogPostPage', () => {
  it('maps posts and pagination meta', () => {
    const page = mapBlogPostPage({
      data: [postDto, { id: '', title: '' }],
      pagination: { current_page: 1, last_page: 2, per_page: 12, total: 21 },
    });

    expect(page.posts.map((item) => item.slug)).toEqual(['koruklu-cizme-kombin-rehberi']);
    expect(page).toMatchObject({ currentPage: 1, lastPage: 2, total: 21 });
  });

  it('treats a response without pagination as a single page', () => {
    expect(mapBlogPostPage({ data: [postDto] })).toMatchObject({ currentPage: 1, lastPage: 1, total: 1 });
    expect(mapBlogPostPage({})).toEqual({ posts: [], currentPage: 1, lastPage: 1, total: 0 });
  });
});

describe('mapBlogCategories', () => {
  it('maps titles, derives missing slugs and removes duplicates', () => {
    expect(
      mapBlogCategories([
        { id: 8, title: 'Kazak/Triko', slug: 'kazak' },
        { id: 1, name: 'Yaz Modası' },
        { id: 9, title: 'Kazak tekrar', slug: 'kazak' },
        { id: 10, title: '' },
      ]),
    ).toEqual([
      { id: '8', title: 'Kazak/Triko', slug: 'kazak' },
      { id: '1', title: 'Yaz Modası', slug: 'yaz-modasi' },
    ]);
  });
});
