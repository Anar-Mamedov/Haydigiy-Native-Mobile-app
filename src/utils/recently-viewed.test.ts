import { appStorage } from '@/lib/storage/mmkv';
import {
  getViewedProducts,
  trackViewedProduct,
  clearViewedProducts,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  ViewedProduct,
} from './recently-viewed';

describe('recently-viewed storage utility', () => {
  beforeEach(async () => {
    await appStorage.clearAll();
  });

  describe('recently viewed products', () => {
    const productFixture: Omit<ViewedProduct, 'viewedAt'> = {
      id: 'p1',
      name: 'Test Dress',
      slug: 'test-dress',
      thumb: 'https://example.com/p1.png',
      price: '150',
    };

    it('returns empty array when no products are viewed', async () => {
      const list = await getViewedProducts();
      expect(list).toEqual([]);
    });

    it('tracks a viewed product and puts it at the beginning', async () => {
      await trackViewedProduct(productFixture);
      const list = await getViewedProducts();
      expect(list).toHaveLength(1);
      expect(list[0]?.id).toBe('p1');
      expect(list[0]?.name).toBe('Test Dress');
      expect(list[0]?.viewedAt).toBeGreaterThan(0);
    });

    it('moves existing product to the top if viewed again', async () => {
      await trackViewedProduct({ id: 'p1', name: 'Dress 1', slug: 'd1' });
      await trackViewedProduct({ id: 'p2', name: 'Dress 2', slug: 'd2' });
      await trackViewedProduct({ id: 'p1', name: 'Dress 1', slug: 'd1' });

      const list = await getViewedProducts();
      expect(list).toHaveLength(2);
      expect(list[0]?.id).toBe('p1');
      expect(list[1]?.id).toBe('p2');
    });

    it('caps recently viewed list at 12 items', async () => {
      for (let i = 1; i <= 15; i++) {
        await trackViewedProduct({
          id: `p-${i}`,
          name: `Dress ${i}`,
          slug: `d-${i}`,
        });
      }

      const list = await getViewedProducts();
      expect(list).toHaveLength(12);
      expect(list[0]?.id).toBe('p-15'); // Most recent at top
      expect(list[11]?.id).toBe('p-4');  // Oldest remaining at bottom
    });

    it('clears all viewed products', async () => {
      await trackViewedProduct(productFixture);
      await clearViewedProducts();
      const list = await getViewedProducts();
      expect(list).toEqual([]);
    });
  });

  describe('search history', () => {
    it('returns empty array initially', async () => {
      const history = await getSearchHistory();
      expect(history).toEqual([]);
    });

    it('adds search queries and deduplicates them to the top', async () => {
      await addSearchHistory('elbise');
      await addSearchHistory('t-shirt');
      await addSearchHistory('ELBİSE'); // case-insensitive deduplication check

      const history = await getSearchHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toBe('ELBİSE');
      expect(history[1]).toBe('t-shirt');
    });

    it('caps search history at 10 items', async () => {
      for (let i = 1; i <= 12; i++) {
        await addSearchHistory(`query-${i}`);
      }

      const history = await getSearchHistory();
      expect(history).toHaveLength(10);
      expect(history[0]).toBe('query-12');
      expect(history[9]).toBe('query-3');
    });

    it('clears search history', async () => {
      await addSearchHistory('elbise');
      await clearSearchHistory();
      const history = await getSearchHistory();
      expect(history).toEqual([]);
    });
  });
});
