import type { InfoDocumentSlug } from '@/features/info-pages/data/info-page.types';

/**
 * Giriş, hızlı giriş ve kayıt ekranlarının açtığı yasal metinler. Ekranlar
 * belge seçmez, bu tek eşlemeden okur; böylece giriş ile kayıt her zaman aynı
 * Aydınlatma Metni'ni ve Gizlilik Politikası'nı gösterir (web
 * `LegalDocumentModal` ile aynı belgeler, HF-67 / HMA-77).
 */
export const AUTH_LEGAL_DOCUMENTS = {
  disclosure: 'kisisel-verilerin-korunmasi',
  privacyPolicy: 'gizlilik-politikasi',
  termsOfUse: 'kullanim-kosullari',
  membershipAgreement: 'uyelik-sozlesmesi',
  explicitConsent: 'acik-riza-metni',
  electronicMessage: 'ticari-elektronik-ileti',
} as const satisfies Record<string, InfoDocumentSlug>;

export type AuthLegalDocument = keyof typeof AUTH_LEGAL_DOCUMENTS;
