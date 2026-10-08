/** Web blog sayfalarındaki metinlerle birebir aynı. */
export const BLOG_TEXTS = {
  allCategories: 'Tümü',
  answerSummaryTitle: 'Kısa Cevap',
  emptyDescription: 'Yeni stil notları için yakında tekrar uğrayın.',
  emptyTitle: 'Henüz yayınlanmış bir yazı yok.',
  eyebrow: 'Stil · İlham · HaydiGiy',
  faqEyebrow: 'Merak edilenler',
  faqTitle: 'Sık Sorulan Sorular',
  listingDescription:
    'Sezonun öne çıkan stilleri, kombin fikirleri ve gardırobunuza ilham verecek editoryal seçkiler.',
  listingTitle: 'Blog',
  productsTitle: 'Yazıdaki ürünler',
  readMore: 'Yazıyı oku',
  scrollHint: 'Kaydır →',
} as const;

/** Kategori şeridindeki "Tümü" sekmesinin anahtarı; gerçek kategori slug'larıyla çakışmaz. */
export const BLOG_ALL_CATEGORIES_KEY = '__all__';

/** Kapak görseli olmayan kartlarda gösterilen marka monogramı (web ile aynı). */
export const BLOG_IMAGE_PLACEHOLDER = 'HG';

/**
 * Manşet kartının görsel üstü karartması (web: `from-black/80 via-black/15 to-transparent`).
 * Metin her iki temada da görselin üstünde beyaz kaldığı için tema token'ı yoktur;
 * expo-linear-gradient'e verilecek duraklar burada toplanır.
 */
export const BLOG_COVER_SCRIM_GRADIENT = [
  'rgba(0, 0, 0, 0)',
  'rgba(0, 0, 0, 0.15)',
  'rgba(0, 0, 0, 0.8)',
] as const;
