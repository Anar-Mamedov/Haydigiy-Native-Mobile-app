import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { YStack } from 'tamagui';
import { AppCheckbox, InlineTextLink } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { useOpenAuthLegalDocument } from '../hooks/use-open-auth-legal-document';
import { RegisterFormData } from '../schemas/auth.schema';

type RegisterConsentFieldsProps = {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

/**
 * Kayıt formundaki onaylar (web `RegisterConsents`, HF-62): açık rıza, ticari
 * elektronik ileti ve "Aydınlatma Metni'ni okudum ve anladım" kutuları, altında
 * koşullar satırı. Hepsi boş başlar; zorunluluğu şema belirler. Metinler giriş
 * formundaki yasal notla aynı belgelerdir (`AUTH_LEGAL_DOCUMENTS`) ve bilgi sayfası
 * ekranında açılır; yalnız kutu basılabilir olduğu için bağlantıya basmak kutuyu
 * değiştirmez.
 */
export function RegisterConsentFields({ control, errors }: RegisterConsentFieldsProps) {
  const openDocument = useOpenAuthLegalDocument();

  return (
    <YStack gap="$3" marginTop="$2">
      <Controller
        name="explicitConsent"
        control={control}
        render={({ field: { value, onChange } }) => (
          <AppCheckbox accessibilityLabel="Açık rıza onayı" checked={value} onChange={onChange}>
            <Paragraph size="$2" color="$color10" lineHeight="$4">
              Tarafıma avantajlı tekliflerin sunulabilmesi amacıyla kişisel verilerimin işlenmesine ve paylaşılmasına{' '}
              <InlineTextLink onPress={() => openDocument('explicitConsent')}>açık rıza</InlineTextLink> veriyorum.
            </Paragraph>
          </AppCheckbox>
        )}
      />

      <Controller
        name="commercial"
        control={control}
        render={({ field: { value, onChange } }) => (
          <AppCheckbox accessibilityLabel="Ticari elektronik ileti onayı" checked={value} onChange={onChange}>
            <Paragraph size="$2" color="$color10" lineHeight="$4">
              <InlineTextLink onPress={() => openDocument('electronicMessage')}>
                Tarafıma elektronik ileti gönderilmesini kabul ediyorum.
              </InlineTextLink>
            </Paragraph>
          </AppCheckbox>
        )}
      />

      <Controller
        name="kvkk"
        control={control}
        render={({ field: { value, onChange } }) => (
          <AppCheckbox accessibilityLabel="Aydınlatma Metni onayı" checked={value} onChange={onChange}>
            <Paragraph size="$2" color="$color10" lineHeight="$4">
              Kişisel verilerimin işlenmesine yönelik{' '}
              <InlineTextLink onPress={() => openDocument('disclosure')}>Aydınlatma Metni</InlineTextLink>
              ’ni okudum ve anladım.
            </Paragraph>
            {errors.kvkk ? (
              <Paragraph color="$red10" size="$1" marginTop="$1">
                {errors.kvkk.message}
              </Paragraph>
            ) : null}
          </AppCheckbox>
        )}
      />

      <Paragraph size="$1" color="$color10" lineHeight="$3">
        Hesap oluşturarak{' '}
        <InlineTextLink onPress={() => openDocument('termsOfUse')}>Kullanım Koşulları</InlineTextLink>
        ’nı kabul etmiş olursunuz. Lütfen platformumuzun{' '}
        <InlineTextLink onPress={() => openDocument('privacyPolicy')}>Gizlilik Politikası</InlineTextLink>
        ’nı okuyun.
      </Paragraph>
    </YStack>
  );
}
