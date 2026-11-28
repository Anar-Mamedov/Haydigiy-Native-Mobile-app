import React from 'react';
import { InlineTextLink } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { useOpenAuthLegalDocument } from '../hooks/use-open-auth-legal-document';

/**
 * Giriş formunun altındaki yasal bilgilendirme. Metin web giriş ekranıyla
 * aynıdır; Aydınlatma Metni ve Gizlilik Politikası kayıt formundaki belgelerin
 * aynısını açar (`AUTH_LEGAL_DOCUMENTS`).
 */
export function LoginLegalNotice() {
  const openDocument = useOpenAuthLegalDocument();

  return (
    <Paragraph size="$2" color="$color10" textAlign="center" lineHeight="$4">
      Kişisel verileriniz,{' '}
      <InlineTextLink onPress={() => openDocument('disclosure')}>Aydınlatma Metni</InlineTextLink>{' '}
      kapsamında işlenmektedir. “Giriş Yap” butonuna basarak{' '}
      <InlineTextLink onPress={() => openDocument('membershipAgreement')}>Üyelik Sözleşmesi</InlineTextLink>
      ’ni ve{' '}
      <InlineTextLink onPress={() => openDocument('privacyPolicy')}>Gizlilik Politikası</InlineTextLink>
      ’nı okuduğunuzu ve kabul ettiğinizi onaylıyorsunuz.
    </Paragraph>
  );
}
