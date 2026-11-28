import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { infoPageRoute } from '@/features/info-pages/routes';
import { AUTH_LEGAL_DOCUMENTS, AuthLegalDocument } from '../constants/auth-legal-documents';

/**
 * Giriş ve kayıt ekranlarındaki yasal metin bağlantılarının ortak açıcısı:
 * belgeyi bilgi sayfası ekranında açar. Form ekranı yığında kaldığı için geri
 * dönüldüğünde girilen bilgiler kaybolmaz.
 */
export function useOpenAuthLegalDocument() {
  const router = useRouter();

  return useCallback(
    (document: AuthLegalDocument) => router.push(infoPageRoute(AUTH_LEGAL_DOCUMENTS[document])),
    [router],
  );
}
