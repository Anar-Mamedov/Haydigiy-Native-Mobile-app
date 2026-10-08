/**
 * Kategori adını web'in `/blog/kategori/{slug}` adresindeki biçime çevirir.
 * Web `src/lib/blogSlug.ts` ile birebir aynıdır; biri değişirse diğeri de
 * güncellenmeli, yoksa web'den gelen kategori bağlantıları eşleşmez.
 */
export function slugifyBlogCategory(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıİ]/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
