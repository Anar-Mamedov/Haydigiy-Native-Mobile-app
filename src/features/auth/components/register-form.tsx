import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { YStack, Spinner } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppInput, AppButton, PasswordVisibilityToggle } from '@/components/ui';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';
import { useRegisterMutation } from '../api/auth.mutations';
import { RegisterConsentFields } from './register-consent-fields';
import { sanitizeTurkishMobileInput, formatTurkishPhoneDisplay } from '@/utils/turkish-phone';
import { toPersonName } from '@/utils/normalize-text';

interface RegisterFormProps {
  onSuccess: (phone: string) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      // Web gibi hepsi boş başlar: önceden işaretli ticari ileti onayı geçerli bir onay sayılmaz.
      explicitConsent: false,
      commercial: false,
      kvkk: false,
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
        explicit_consent: data.explicitConsent,
      };

      await registerMutation.mutateAsync(payload);
      onSuccess(data.phone);
    } catch (error: any) {
      // Axios hatası istek gövdesini (şifre, OTP) taşır; release build'de cihaz loguna düşmesin.
      if (__DEV__) console.error('Register error:', error);
      const apiMessage = error?.response?.data?.message || error?.message;
      setServerError(apiMessage || 'Kayıt işlemi sırasında bir hata oluştu.');
    }
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

      <RegisterConsentFields control={control} errors={errors} />

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
    </YStack>
  );
}
