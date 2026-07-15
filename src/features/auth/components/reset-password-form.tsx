import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Paragraph, Spinner, YStack } from 'tamagui';
import { AppButton, AppInput, PasswordVisibilityToggle, SectionCard } from '@/components/ui';
import { useResetPasswordMutation } from '../api/auth.mutations';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/auth.schema';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
}

function getResetErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Şifre sıfırlanırken bir hata oluştu.';
  }

  return error instanceof Error
    ? error.message
    : 'Ağ hatası oluştu veya sunucuya ulaşılamadı. Lütfen tekrar deneyin.';
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const resetPassword = useResetPasswordMutation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);

    try {
      await resetPassword.mutateAsync({
        token,
        new_password: data.newPassword,
      });
      setCompleted(true);
    } catch (error: unknown) {
      setServerError(getResetErrorMessage(error));
    }
  };

  if (completed) {
    return (
      <SectionCard>
        <YStack gap="$4">
          <YStack gap="$2">
            <Paragraph color="$color" fontSize="$7" fontWeight="700">
              Şifreniz Güncellendi
            </Paragraph>
            <Paragraph color="$color10">
              Yeni şifrenizle hesabınıza giriş yapabilirsiniz.
            </Paragraph>
          </YStack>

          <AppButton
            backgroundColor="$brand"
            borderColor="transparent"
            color="white"
            id="reset-password-login"
            onPress={onSuccess}
          >
            Giriş Yap
          </AppButton>
        </YStack>
      </SectionCard>
    );
  }

  return (
    <YStack gap="$4">
      <YStack gap="$2">
        <Paragraph color="$color" fontSize="$7" fontWeight="700">
          Yeni Şifre Belirle
        </Paragraph>
        <Paragraph color="$color10">Hesabınız için yeni bir şifre belirleyin.</Paragraph>
      </YStack>

      <SectionCard>
        <YStack gap="$4">
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                autoCapitalize="none"
                backgroundColor="$color1"
                errorMessage={errors.newPassword?.message}
                id="reset-password-new"
                label="Yeni Şifre"
                onBlur={onBlur}
                onChangeText={onChange}
                rightElement={
                  <PasswordVisibilityToggle
                    onToggle={() => setShowNewPassword((visible) => !visible)}
                    visible={showNewPassword}
                  />
                }
                secureTextEntry={!showNewPassword}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                autoCapitalize="none"
                backgroundColor="$color1"
                errorMessage={errors.confirmPassword?.message}
                id="reset-password-confirm"
                label="Yeni Şifre (Tekrar)"
                onBlur={onBlur}
                onChangeText={onChange}
                rightElement={
                  <PasswordVisibilityToggle
                    onToggle={() => setShowConfirmPassword((visible) => !visible)}
                    visible={showConfirmPassword}
                  />
                }
                secureTextEntry={!showConfirmPassword}
                value={value}
              />
            )}
          />
        </YStack>
      </SectionCard>

      {serverError ? (
        <Paragraph color="$red10" fontWeight="500" size="$3" textAlign="center">
          {serverError}
        </Paragraph>
      ) : null}

      <AppButton
        backgroundColor="$brand"
        borderColor="transparent"
        color="white"
        disabled={isSubmitting || resetPassword.isPending}
        id="reset-password-submit"
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting || resetPassword.isPending ? (
          <Spinner color="white" />
        ) : (
          'Şifremi Güncelle'
        )}
      </AppButton>
    </YStack>
  );
}
