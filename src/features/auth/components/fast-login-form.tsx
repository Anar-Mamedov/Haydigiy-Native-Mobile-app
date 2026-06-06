import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { YStack, Paragraph, Spinner } from 'tamagui';
import { AppInput, AppButton } from '@/components/ui';
import { fastLoginSchema, FastLoginFormData } from '../schemas/auth.schema';
import { useFastLoginInitMutation } from '../api/auth.mutations';
import {
  extractTurkishNationalNumber,
  formatTurkishPhoneDisplay,
  sanitizeTurkishMobileInput,
} from '@/utils/turkish-phone';

// "0532 123 45 67" -> 14 characters.
const PHONE_DISPLAY_MAX_LENGTH = 14;

interface FastLoginFormProps {
  onSuccess: (identifier: string, isNewUser: boolean, type: 'phone' | 'email', remainingSeconds: number) => void;
  onBackToLogin: () => void;
}

export function FastLoginForm({ onSuccess, onBackToLogin }: FastLoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const fastLoginInit = useFastLoginInitMutation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FastLoginFormData>({
    resolver: zodResolver(fastLoginSchema),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (data: FastLoginFormData) => {
    setServerError(null);
    try {
      // National number (without leading 0) is what the backend expects.
      const nationalNumber = extractTurkishNationalNumber(data.phone);

      const response = await fastLoginInit.mutateAsync({ identifier: nationalNumber });

      const isNewUser = Boolean(response.is_new_user);
      const remainingSeconds = typeof response.remaining_seconds === 'number' ? response.remaining_seconds : 60;

      onSuccess(nationalNumber, isNewUser, 'phone', remainingSeconds);
    } catch (error: any) {
      console.error('Fast login init error:', error);
      const apiMessage = error?.response?.data?.message || error?.message;
      setServerError(apiMessage || 'Giriş kodu gönderilirken bir hata oluştu.');
    }
  };

  return (
    <YStack gap="$4" width="100%">
      <YStack gap="$1">
        <Paragraph fontSize="$6" fontWeight="700" color="$color">
          Telefonla Hızlı Giriş
        </Paragraph>
        <Paragraph size="$2" color="$color10">
          Devam etmek için telefon numaranızı girin. Size bir doğrulama kodu göndereceğiz.
        </Paragraph>
      </YStack>

      <Controller
        name="phone"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="fast-login-phone"
            label="Telefon Numarası"
            placeholder="05XX XXX XX XX"
            value={formatTurkishPhoneDisplay(value)}
            onChangeText={(text) => onChange(sanitizeTurkishMobileInput(text))}
            onBlur={onBlur}
            errorMessage={errors.phone?.message}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            maxLength={PHONE_DISPLAY_MAX_LENGTH}
          />
        )}
      />

      {serverError && (
        <Paragraph color="$red10" size="$3" textAlign="center" fontWeight="500">
          {serverError}
        </Paragraph>
      )}

      <AppButton
        id="fast-login-submit-btn"
        backgroundColor="$brand"
        color="white"
        borderColor="transparent"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        pressStyle={{ opacity: 0.8 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Devam Et'}
      </AppButton>

      <AppButton
        id="fast-login-back-btn"
        backgroundColor="transparent"
        color="$color"
        borderColor="$borderColor"
        onPress={onBackToLogin}
        disabled={isSubmitting}
        pressStyle={{ opacity: 0.8 }}
      >
        Şifre ile Giriş Yap
      </AppButton>
    </YStack>
  );
}
