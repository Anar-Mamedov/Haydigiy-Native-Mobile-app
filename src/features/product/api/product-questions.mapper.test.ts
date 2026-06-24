import { mapProductQuestionsPage } from './product-questions.mapper';

describe('mapProductQuestionsPage', () => {
  it('maps product, tags, questions and the reply (name is not masked)', () => {
    const result = mapProductQuestionsPage({
      product: { id: 7, name: 'Şort', price: '29,99', media: { medium: 'http://img/p.jpg' }, cart_count: 10 },
      filters: ['kumaş', 'beden'],
      questions: {
        data: [
          {
            id: 11,
            question: 'Bedeni dar mı?',
            user_name: 'Ayşe E.',
            created_at: '2026-05-19T00:00:00Z',
            like_count: 2,
            tag: 'beden',
            reply: { admin_name: 'Satıcı', text: 'Standart kalıp.', created_at: '2026-05-20T00:00:00Z' },
          },
        ],
      },
    });

    expect(result.product).toMatchObject({ id: '7', name: 'Şort', imageUrl: 'http://img/p.jpg', cartCount: 10 });
    expect(result.tags).toEqual(['kumaş', 'beden']);
    expect(result.questions[0]).toMatchObject({
      id: '11',
      question: 'Bedeni dar mı?',
      userName: 'Ayşe E.',
      likeCount: 2,
      tag: 'beden',
      reply: { adminName: 'Satıcı', text: 'Standart kalıp.' },
    });
  });

  it('supports tags under a "tags" key and a missing reply', () => {
    const result = mapProductQuestionsPage({
      filters: { tags: ['renk'] },
      questions: { data: [{ id: 1, question: 'Soru', user_name: 'Ali', created_at: '', like_count: null, reply: null }] },
    });
    expect(result.tags).toEqual(['renk']);
    expect(result.product.id).toBe('');
    expect(result.questions[0].reply).toBeNull();
    expect(result.questions[0].tag).toBeNull();
    expect(result.questions[0].likeCount).toBe(0);
  });
});
