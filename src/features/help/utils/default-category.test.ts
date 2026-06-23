import { getDefaultCategoryId } from './default-category';
import { HelpCategory } from '@/types/help.types';

const cat = (id: number, title: string): HelpCategory => ({ id, title, articles: [] });

describe('getDefaultCategoryId', () => {
  it('returns null when there are no categories', () => {
    expect(getDefaultCategoryId([])).toBeNull();
  });

  it('returns the first category id', () => {
    const categories = [cat(1, 'Siparişlerim'), cat(2, 'Ödeme'), cat(3, 'İptal & İade')];
    expect(getDefaultCategoryId(categories)).toBe(1);
  });

  it('returns the single category when there is only one', () => {
    expect(getDefaultCategoryId([cat(9, 'Genel')])).toBe(9);
  });
});
