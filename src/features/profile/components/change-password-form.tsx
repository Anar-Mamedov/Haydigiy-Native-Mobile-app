import { useState } from 'react';
import { Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from '@tamagui/lucide-icons-2';
import { Button, Spinner, YStack } from 'tamagui';
import { AppButton, AppInput, SectionCard } from '@/components/ui';
import { useChangePasswordMutation } from '../api/profile.mutations';
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from '../schemas/change-password.schema';

function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <Button
      accessibilityLabel={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
      chromeless
      circular
      icon={
        visible ? <EyeOff color="$color10" size={20} /> : <Eye color="$color10" size={20} />
      }
      onPress={onToggle}
      pressStyle={{ opacity: 0.6 }}
      size="$2"
    />
  );
}

/** Password change form mirroring the web flow, with proper RHF + Zod validation. */
export function ChangePasswordForm() {
  const changePassword = useChangePasswordMutation();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword.mutateAsync(data.newPassword);
      reset({ newPassword: '', confirmPassword: '' });
      Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi.');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Şifre değiştirme sırasında bir hata oluştu.';
      Alert.alert('Hata', message);
    }
  };

  return (
    <YStack gap="$4">
      <SectionCard>
        <YStack gap="$4">
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                autoCapitalize="none"
                backgroundColor="$color1"
                errorMessage={errors.newPassword?.message}
                helperText="Şifreniz 1 büyük harf, 1 küçük harf ve rakam içermelidir."
                id="change-password-new"
                label="Yeni Şifre"
                onBlur={onBlur}
                onChangeText={onChange}
                rightElement={
                  <EyeToggle onToggle={() => setShowNew((prev) => !prev)} visible={showNew} />
                }
                secureTextEntry={!showNew}
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                autoCapitalize="none"
                backgroundColor="$color1"
                errorMessage={errors.confirmPassword?.message}
                id="change-password-confirm"
                label="Yeni Şifre (Tekrar)"
                onBlur={onBlur}
                onChangeText={onChange}
                rightElement={
                  <EyeToggle
                    onToggle={() => setShowConfirm((prev) => !prev)}
                    visible={showConfirm}
                  />
                }
                secureTextEntry={!showConfirm}
                value={value}
              />
            )}
          />
        </YStack>
      </SectionCard>

      <AppButton
        backgroundColor="$brand"
        borderColor="transparent"
        color="white"
        disabled={isSubmitting}
        id="change-password-submit"
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Kaydet'}
      </AppButton>
    </YStack>
  );
}
