import { getDefaultCategoryId } from './default-category';
import { HelpCategory } from '@/types/help.types';

const cat = (id: number, title: string, slug?: string): HelpCategory => ({
  id,
  title,
  slug,
  articles: [],
});

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

  it('opens the category requested by the web link slug', () => {
    // web `/yardim?kategori=iptal-iade` ve `/iade-degisim`
    const categories = [
      cat(1, 'Siparişlerim', 'siparislerim'),
      cat(2, 'Ödeme', 'odeme'),
      cat(3, 'İptal & İade', 'iptal-iade'),
    ];
    expect(getDefaultCategoryId(categories, 'iptal-iade')).toBe(3);
    expect(getDefaultCategoryId(categories, ' IPTAL-IADE ')).toBe(3);
  });

  it('falls back to the first category for an unknown or empty slug', () => {
    const categories = [cat(1, 'Siparişlerim', 'siparislerim'), cat(2, 'Ödeme', 'odeme')];
    expect(getDefaultCategoryId(categories, 'yok')).toBe(1);
    expect(getDefaultCategoryId(categories, '')).toBe(1);
    expect(getDefaultCategoryId(categories, null)).toBe(1);
  });
});
