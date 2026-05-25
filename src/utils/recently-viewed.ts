import { appStorage } from '@/lib/storage/mmkv';

const RECENTLY_VIEWED_KEY = 'viewedProducts';
const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_RECENTLY_VIEWED = 12;
const MAX_SEARCH_HISTORY = 10;

export interface ViewedProduct {
  id: string | number;
  name: string;
  slug: string;
  thumb?: string;
  price?: string;
  viewedAt: number;
}

export async function getViewedProducts(): Promise<ViewedProduct[]> {
  try {
    const raw = await appStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ViewedProduct[];
  } catch (err) {
    console.error('Error reading viewed products:', err);
    return [];
  }
}

export async function trackViewedProduct(product: Omit<ViewedProduct, 'viewedAt'>): Promise<void> {
  try {
    const list = await getViewedProducts();
    // Remove if already exists to move to top
    const filtered = list.filter((p) => String(p.id) !== String(product.id));
    const updated = [
      { ...product, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENTLY_VIEWED);
    await appStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error tracking viewed product:', err);
  }
}

export async function clearViewedProducts(): Promise<void> {
  try {
    await appStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch (err) {
    console.error('Error clearing viewed products:', err);
  }
}

export async function getSearchHistory(): Promise<string[]> {
  try {
    const raw = await appStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err) {
    console.error('Error reading search history:', err);
    return [];
  }
}

export async function addSearchHistory(term: string): Promise<string[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];
  try {
    const list = await getSearchHistory();
    const filtered = list.filter((t) => t.toLocaleLowerCase('tr') !== trimmed.toLocaleLowerCase('tr'));
    const updated = [trimmed, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    await appStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving search history:', err);
    return [];
  }
}

export async function clearSearchHistory(): Promise<void> {
  try {
    await appStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (err) {
    console.error('Error clearing search history:', err);
  }
}
