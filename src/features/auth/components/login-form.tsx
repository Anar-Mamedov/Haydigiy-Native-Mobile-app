import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { YStack, Paragraph, Spinner } from 'tamagui';
import { AppInput, AppButton, PasswordVisibilityToggle } from '@/components/ui';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';
import { useLoginMutation } from '../api/auth.mutations';
import { useAuthStore } from '../store/use-auth-store';
import { extractTurkishNationalNumber, formatTurkishPhoneDisplay } from '@/utils/turkish-phone';

// Login accepts an email OR a phone in the same field, so it needs to tell them
// apart; phone normalization/formatting itself lives in the shared util.
const isEmailLikeInput = (value: string): boolean => {
  return /[a-zA-Z@._-]/.test(value);
};

interface LoginFormProps {
  onSuccess: () => void;
  onFastLoginPress: () => void;
}

export function LoginForm({ onSuccess, onFastLoginPress }: LoginFormProps) {
  const storeLogin = useAuthStore((state) => state.login);
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const identifier = data.identifier.trim();
      const nationalNumber = extractTurkishNationalNumber(identifier);
      const isEmail = identifier.includes('@');

      const payload = isEmail
        ? {
            login_type: 'email' as const,
            email: identifier,
            password: data.password,
          }
        : {
            login_type: 'phone' as const,
            country_code: '+90',
            phone: nationalNumber,
            password: data.password,
          };

      const response = await loginMutation.mutateAsync(payload);

      if (response.token && response.user) {
        const userWithPhone = {
          ...response.user,
          phoneNumber: response.user.phone || nationalNumber,
        };
        await storeLogin(response.token, userWithPhone);
        onSuccess();
      } else {
        setServerError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const apiMessage = error?.response?.data?.message || error?.message;
      setServerError(apiMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleIdentifierChange = (text: string, onChange: (v: string) => void) => {
    if (!text) {
      onChange('');
      return;
    }
    if (isEmailLikeInput(text)) {
      onChange(text);
    } else {
      onChange(extractTurkishNationalNumber(text));
    }
  };

  const displayIdentifier = (value: string): string => {
    if (!value) return '';
    if (isEmailLikeInput(value)) {
      return value;
    }
    return formatTurkishPhoneDisplay(value);
  };

  return (
    <YStack gap="$4" width="100%">
      <Controller
        name="identifier"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="login-identifier"
            label="E-posta veya Telefon Numarası"
            placeholder="E-posta veya telefon (5xxxxxxxxx)"
            value={displayIdentifier(value)}
            onChangeText={(text) => handleIdentifierChange(text, onChange)}
            onBlur={onBlur}
            errorMessage={errors.identifier?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            id="login-password"
            label="Şifre"
            placeholder="Şifrenizi girin"
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

      {serverError && (
        <Paragraph color="$red10" size="$3" textAlign="center" fontWeight="500">
          {serverError}
        </Paragraph>
      )}

      <AppButton
        id="login-submit-btn"
        backgroundColor="$brand"
        color="white"
        borderColor="transparent"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        pressStyle={{ opacity: 0.8 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Giriş Yap'}
      </AppButton>

      <AppButton
        id="login-fast-btn"
        backgroundColor="transparent"
        color="$brand"
        borderColor="$brand"
        borderWidth={1}
        onPress={onFastLoginPress}
        disabled={isSubmitting}
        pressStyle={{ opacity: 0.8 }}
      >
        Telefonla Hızlı Giriş
      </AppButton>

      <Paragraph size="$2" color="$color10" textAlign="center">
        Kişisel verileriniz, Aydınlatma Metni kapsamında işlenmektedir. Giriş yaparak Üyelik Sözleşmesi ve Gizlilik Politikası şartlarını kabul etmiş olursunuz.
      </Paragraph>
    </YStack>
  );
}
