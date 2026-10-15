import React from 'react';
import { useRouter } from 'expo-router';
import { InlineTextLink } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { infoPageRoute } from '@/features/info-pages/routes';
import { InfoDocumentSlug } from '@/features/info-pages/data/info-page.types';

/**
 * Giriş formunun altındaki yasal bilgilendirme. Üç metin de alt bilgideki
 * bağlantılarla aynı bilgi sayfası ekranında açılır; metin web giriş ekranıyla
 * aynıdır.
 */
export function LoginLegalNotice() {
  const router = useRouter();
  const openDocument = (slug: InfoDocumentSlug) => router.push(infoPageRoute(slug));

  return (
    <Paragraph size="$2" color="$color10" textAlign="center" lineHeight="$4">
      Kişisel verileriniz,{' '}
      <InlineTextLink onPress={() => openDocument('aydinlatma-metni')}>Aydınlatma Metni</InlineTextLink>{' '}
      kapsamında işlenmektedir. “Giriş Yap” butonuna basarak{' '}
      <InlineTextLink onPress={() => openDocument('uyelik-sozlesmesi')}>Üyelik Sözleşmesi</InlineTextLink>
      ’ni ve{' '}
      <InlineTextLink onPress={() => openDocument('kisisel-verilerin-korunmasi')}>
        Gizlilik Politikası
      </InlineTextLink>
      ’nı okuduğunuzu ve kabul ettiğinizi onaylıyorsunuz.
    </Paragraph>
  );
}
