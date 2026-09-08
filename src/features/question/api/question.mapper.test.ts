import { mapMyQuestionsPage } from './question.mapper';

describe('mapMyQuestionsPage', () => {
  it('maps a question and its store reply', () => {
    const page = mapMyQuestionsPage({
      data: [
        {
          id: 412,
          question: 'Bu ürün büyük mü kalıyor?',
          status: 'answered',
          created_at: '05.09.2026',
          like_count: 3,
          product: { id: 8891, name: 'Test Ürün', slug: 'test-urun', image: 'https://cdn/p.jpg' },
          reply: { admin_name: 'HaydiGiy', text: 'Normal kalıp.', created_at: '06.09.2026 11:20' },
        },
      ],
      meta: { current_page: 2, last_page: 5, total: 47, per_page: 10 },
    });

    expect(page.items[0]).toEqual({
      id: 412,
      question: 'Bu ürün büyük mü kalıyor?',
      status: 'answered',
      createdAt: '05.09.2026',
      likeCount: 3,
      product: { id: 8891, name: 'Test Ürün', slug: 'test-urun', image: 'https://cdn/p.jpg' },
      reply: { adminName: 'HaydiGiy', text: 'Normal kalıp.', createdAt: '06.09.2026 11:20' },
    });
    expect(page.pagination).toEqual({ currentPage: 2, lastPage: 5, total: 47, perPage: 10 });
  });

  it('leaves reply null while the question is unanswered', () => {
    const page = mapMyQuestionsPage({ data: [{ id: 9, question: 'Stok gelecek mi?', status: 'pending', reply: null }] });

    expect(page.items[0].reply).toBeNull();
    expect(page.items[0].status).toBe('pending');
  });

  it('drops a question with no text and a reply with no text', () => {
    const page = mapMyQuestionsPage({
      data: [
        { id: 1, question: '   ', status: 'pending' },
        { id: 2, question: 'Geçerli soru', status: 'answered', reply: { admin_name: 'HaydiGiy', text: '   ' } },
      ],
    });

    expect(page.items).toHaveLength(1);
    expect(page.items[0].id).toBe(2);
    expect(page.items[0].reply).toBeNull();
  });

  it('falls back to a generic store name when the reply has none', () => {
    const page = mapMyQuestionsPage({
      data: [{ id: 3, question: 'Soru', status: 'answered', reply: { text: 'Cevap' } }],
    });

    expect(page.items[0].reply?.adminName).toBe('HaydiGiy');
  });

  it('treats an unknown status as pending', () => {
    const page = mapMyQuestionsPage({ data: [{ id: 1, question: 'Soru', status: 'wat' }] });

    expect(page.items[0].status).toBe('pending');
  });

  it('keeps a deleted product out of the model instead of guessing', () => {
    const page = mapMyQuestionsPage({ data: [{ id: 1, question: 'Soru', status: 'pending', product: {} }] });

    expect(page.items[0].product).toBeNull();
  });

  it('assumes a single page when meta is missing', () => {
    const page = mapMyQuestionsPage({ data: [{ id: 1, question: 'Soru', status: 'pending' }] });

    expect(page.pagination).toEqual({ currentPage: 1, lastPage: 1, total: 1, perPage: 1 });
  });

  it('degrades to an empty list on a malformed payload', () => {
    for (const payload of [null, undefined, {}, { data: null }] as const) {
      expect(mapMyQuestionsPage(payload as never).items).toEqual([]);
    }
  });

  it('drops a record without an id', () => {
    expect(mapMyQuestionsPage({ data: [{ question: 'Soru' }] }).items).toHaveLength(0);
  });
});
