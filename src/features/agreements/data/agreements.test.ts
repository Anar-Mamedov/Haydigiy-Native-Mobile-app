import { findInfoDocument } from '@/features/info-pages/data/info-documents';
import { AUTH_LEGAL_DOCUMENTS } from '@/features/auth/constants/auth-legal-documents';
import { AGREEMENTS } from './agreements';

describe('AGREEMENTS', () => {
  it.each([
    ['privacy-policy', AUTH_LEGAL_DOCUMENTS.privacyPolicy],
    ['disclosure', AUTH_LEGAL_DOCUMENTS.disclosure],
  ] as const)(
    'shows the same document as the login/register screens in the “%s” section (HMA-77)',
    (id, slug) => {
      // Sözleşmeler'deki metin, giriş/kayıt ekranlarının açtığı belgeyle aynı olmalı
      const authDocument = findInfoDocument(slug)?.blocks;
      const section = AGREEMENTS.find((agreement) => agreement.id === id);

      expect(authDocument).toBeDefined();
      expect(section?.blocks).toBe(authDocument);
    },
  );

  it('lists every document once', () => {
    const blocks = AGREEMENTS.map((agreement) => agreement.blocks);

    expect(new Set(blocks).size).toBe(AGREEMENTS.length);
  });
});
