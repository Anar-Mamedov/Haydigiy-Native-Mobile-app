import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { YStack, Spinner } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import {
  AppInput,
  AppButton,
  AppCheckbox,
  DisclosureSheet,
  PasswordVisibilityToggle,
} from '@/components/ui';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';
import { useRegisterMutation } from '../api/auth.mutations';
import { KVKK_DISCLOSURE_TEXT, COMMERCIAL_CONSENT_TEXT } from '../constants/auth-texts';
import { sanitizeTurkishMobileInput, formatTurkishPhoneDisplay } from '@/utils/turkish-phone';
import { toPersonName } from '@/utils/normalize-text';

interface RegisterFormProps {
  onSuccess: (phone: string) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [sheetContent, setSheetContent] = useState<{ title: string; text: string } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      phone: '',
      password: '',
      kvkk: true,
      commercial: true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const payload = {
        name: data.name.trim(),
        surname: data.surname.trim(),
        country_code: '+90',
        phone: data.phone,
        email: '',
        password: data.password,
        kvkk_consent: data.kvkk,
        communication_consent: data.commercial,
      };

      await registerMutation.mutateAsync(payload);
      onSuccess(data.phone);
    } catch (error: any) {
      console.error('Register error:', error);
      const apiMessage = error?.response?.data?.message || error?.message;
      setServerError(apiMessage || 'Kayıt işlemi sırasında bir hata oluştu.');
    }
  };

  const openDisclosureSheet = (type: 'kvkk' | 'commercial') => {
    if (type === 'kvkk') {
      setSheetContent({ title: 'AYDINLATMA METNİ', text: KVKK_DISCLOSURE_TEXT });
    } else {
      setSheetContent({ title: 'AÇIK RIZA METNİ', text: COMMERCIAL_CONSENT_TEXT });
    }
    setIsSheetOpen(true);
  };

  return (
    <YStack gap="$4" width="100%">
      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="register-name"
            label="Ad"
            placeholder="Adınız"
            value={value}
            onChangeText={(text) => onChange(toPersonName(text))}
            onBlur={onBlur}
            errorMessage={errors.name?.message}
          />
        )}
      />

      <Controller
        name="surname"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="register-surname"
            label="Soyad"
            placeholder="Soyadınız"
            value={value}
            onChangeText={(text) => onChange(toPersonName(text))}
            onBlur={onBlur}
            errorMessage={errors.surname?.message}
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="register-phone"
            label="Telefon Numarası"
            placeholder="05XX XXX XX XX"
            value={formatTurkishPhoneDisplay(value)}
            onChangeText={(text) => onChange(sanitizeTurkishMobileInput(text))}
            onBlur={onBlur}
            errorMessage={errors.phone?.message}
            keyboardType="phone-pad"
            maxLength={14}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="register-password"
            label="Şifre"
            placeholder="Şifreniz"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={errors.password?.message}
            rightElement={
              <PasswordVisibilityToggle
                onToggle={() => setShowPassword((prev) => !prev)}
                visible={showPassword}
              />
            }
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        )}
      />

      {/* Consent Checkboxes */}
      <YStack gap="$3" marginTop="$2">
        <Controller
          name="kvkk"
          control={control}
          render={({ field: { value, onChange } }) => (
            <AppCheckbox
              accessibilityLabel="KVKK Aydınlatma Metni Onayı"
              checked={value}
              onChange={onChange}
            >
              <Paragraph size="$2" color="$color10" lineHeight="$4">
                Kişisel verilerimin, 6698 sayılı KVKK kapsamında{' '}
                <Paragraph
                  size="$2"
                  color="$brand"
                  fontWeight="700"
                  textDecorationLine="underline"
                  onPress={() => openDisclosureSheet('kvkk')}
                >
                  Aydınlatma Metni
                </Paragraph>
                ’nde belirtilen amaçlarla işlenmesine ve saklanmasına onay veriyorum.
              </Paragraph>
              {errors.kvkk && (
                <Paragraph color="$red10" size="$1" marginTop="$1">
                  {errors.kvkk.message}
                </Paragraph>
              )}
            </AppCheckbox>
          )}
        />

        <Controller
          name="commercial"
          control={control}
          render={({ field: { value, onChange } }) => (
            <AppCheckbox
              accessibilityLabel="Ticari İleti İzni"
              checked={value}
              onChange={onChange}
            >
              <Paragraph size="$2" color="$color10" lineHeight="$4">
                Haydigiy tarafından kampanya, indirim ve bilgilendirmeler amacıyla SMS, e-posta ve arama yoluyla tarafıma{' '}
                <Paragraph
                  size="$2"
                  color="$brand"
                  fontWeight="700"
                  textDecorationLine="underline"
                  onPress={() => openDisclosureSheet('commercial')}
                >
                  ticari elektronik ileti gönderilmesine
                </Paragraph>{' '}
                onay veriyorum.
              </Paragraph>
            </AppCheckbox>
          )}
        />
      </YStack>

      {serverError && (
        <Paragraph color="$red10" size="$3" textAlign="center" fontWeight="500">
          {serverError}
        </Paragraph>
      )}

      <AppButton
        id="register-submit-btn"
        backgroundColor="$brand"
        color="white"
        borderColor="transparent"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        pressStyle={{ opacity: 0.8 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Ücretsiz Üye Ol'}
      </AppButton>

      <DisclosureSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={sheetContent?.title}
        text={sheetContent?.text}
      />
    </YStack>
  );
}
