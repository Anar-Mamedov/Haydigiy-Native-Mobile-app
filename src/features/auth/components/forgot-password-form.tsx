import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Paragraph, Spinner, YStack } from 'tamagui';
import { AppButton, AppInput } from '@/components/ui';
import { useForgotPasswordMutation } from '../api/auth.mutations';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/auth.schema';
import { extractTurkishNationalNumber, formatTurkishPhoneDisplay } from '@/utils/turkish-phone';

const DEFAULT_COOLDOWN_SECONDS = 60;

type ResetDeliveryType = 'email' | 'phone';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

interface ResetErrorResponse {
  message?: string;
  remaining_seconds?: number;
}

function isEmailLikeInput(value: string): boolean {
  return /[a-zA-Z@._-]/.test(value);
}

function getApiError(error: unknown): ResetErrorResponse {
  if (isAxiosError<ResetErrorResponse>(error)) {
    return error.response?.data ?? {};
  }

  return error instanceof Error ? { message: error.message } : {};
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [cooldown, setCooldown] = useState(0);
  const [deliveryType, setDeliveryType] = useState<ResetDeliveryType | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  });

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((remaining) => Math.max(remaining - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (cooldown > 0) return;

    setServerError(null);
    const identifier = data.identifier.trim();
    const type: ResetDeliveryType = identifier.includes('@') ? 'email' : 'phone';

    try {
      const response = await forgotPasswordMutation.mutateAsync(
        type === 'email'
          ? { type, email: identifier }
          : {
              type,
              country_code: '+90',
              phone: extractTurkishNationalNumber(identifier),
            },
      );
      const remainingSeconds = response.remaining_seconds;

      setCooldown(
        typeof remainingSeconds === 'number' && remainingSeconds > 0
          ? remainingSeconds
          : DEFAULT_COOLDOWN_SECONDS,
      );
      setDeliveryType(type);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      if (typeof apiError.remaining_seconds === 'number' && apiError.remaining_seconds > 0) {
        setCooldown(apiError.remaining_seconds);
      }
      setServerError(
        apiError.message ?? 'Ağ hatası oluştu veya sunucuya ulaşılamadı. Lütfen tekrar deneyin.',
      );
    }
  };

  const handleIdentifierChange = (text: string, onChange: (value: string) => void) => {
    onChange(isEmailLikeInput(text) ? text : extractTurkishNationalNumber(text));
  };

  const displayIdentifier = (value: string): string => {
    return isEmailLikeInput(value) ? value : formatTurkishPhoneDisplay(value);
  };

  if (deliveryType) {
    const deliveryMessage =
      deliveryType === 'email'
        ? 'Şifre yenileme bağlantısı e-posta adresinize gönderildi. E-postanızı kontrol edin.'
        : 'Şifre yenileme kodu SMS ile telefon numaranıza gönderildi.';

    return (
      <YStack gap="$3" width="100%">
        <YStack gap="$2">
          <Paragraph color="$color" fontSize="$6" fontWeight="700">
            Bağlantı Gönderildi
          </Paragraph>
          <Paragraph color="$color10">{deliveryMessage}</Paragraph>
        </YStack>

        <AppButton
          id="forgot-password-resend-btn"
          backgroundColor="transparent"
          borderColor="$brand"
          color="$brand"
          disabled={cooldown > 0}
          onPress={() => setDeliveryType(null)}
        >
          {cooldown > 0 ? `${cooldown} sn bekle` : 'Tekrar Gönder'}
        </AppButton>

        <AppButton
          id="forgot-password-back-btn"
          backgroundColor="$brand"
          borderColor="transparent"
          color="white"
          onPress={onBackToLogin}
        >
          Giriş Sayfasına Dön
        </AppButton>
      </YStack>
    );
  }

  return (
    <YStack gap="$3" width="100%">
      <YStack gap="$1">
        <Paragraph color="$color" fontSize="$6" fontWeight="700">
          Şifre Yenileme
        </Paragraph>
        <Paragraph color="$color10" size="$2">
          Şifre yenileme bağlantısı için e-posta adresinizi veya telefon numaranızı girin.
        </Paragraph>
      </YStack>

      <Controller
        name="identifier"
        control={control}
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            id="forgot-password-identifier"
            autoCapitalize="none"
            errorMessage={errors.identifier?.message}
            label="E-posta veya Telefon Numarası"
            onBlur={onBlur}
            onChangeText={(text) => handleIdentifierChange(text, onChange)}
            placeholder="E-posta veya telefon (5xxxxxxxxx)"
            value={displayIdentifier(value)}
          />
        )}
      />

      {serverError ? (
        <Paragraph color="$red10" fontWeight="500" size="$3" textAlign="center">
          {serverError}
        </Paragraph>
      ) : null}

      <AppButton
        id="forgot-password-submit-btn"
        backgroundColor="$brand"
        borderColor="transparent"
        color="white"
        disabled={isSubmitting || forgotPasswordMutation.isPending || cooldown > 0}
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.8 }}
      >
        {isSubmitting || forgotPasswordMutation.isPending ? (
          <Spinner color="white" />
        ) : cooldown > 0 ? (
          `${cooldown} sn bekle`
        ) : (
          'Şifremi Yenile'
        )}
      </AppButton>

      <AppButton
        id="forgot-password-login-btn"
        backgroundColor="transparent"
        borderColor="$borderColor"
        color="$color"
        onPress={onBackToLogin}
        pressStyle={{ opacity: 0.8 }}
      >
        Giriş Sayfasına Dön
      </AppButton>
    </YStack>
  );
}
