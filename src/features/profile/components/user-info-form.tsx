import { ReactNode, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { AppButton, AppInput, AppSelect } from '@/components/ui';
import { extractTurkishNationalNumber, formatTurkishPhoneDisplay } from '@/utils/turkish-phone';
import { UserProfile } from '../api/profile.mapper';
import { useUpdateProfileMutation } from '../api/profile.mutations';
import {
  GENDER_OPTIONS,
  userInfoSchema,
  UserInfoFormData,
} from '../schemas/user-info.schema';
import {
  combineBirthDate,
  getDayOptions,
  getMonthOptions,
  getYearOptions,
  splitBirthDate,
} from '../utils/birth-date';

const DAY_OPTIONS = getDayOptions();
const MONTH_OPTIONS = getMonthOptions();
const YEAR_OPTIONS = getYearOptions();

type UserInfoFormProps = {
  profile: UserProfile;
};

/** Disabled, input-styled box for read-only values (country code / phone). */
function ReadOnlyField({
  children,
  flex,
  width,
}: {
  children: ReactNode;
  flex?: number;
  width?: number;
}) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$color4"
      borderColor="$borderColor"
      borderRadius="$6"
      borderWidth={1}
      flex={flex}
      height={48}
      opacity={0.7}
      paddingHorizontal="$3"
      width={width}
    >
      <Paragraph color="$color11" fontSize={15} numberOfLines={1}>
        {children}
      </Paragraph>
    </XStack>
  );
}

function buildDefaults(profile: UserProfile): UserInfoFormData {
  const parts = splitBirthDate(profile.birthDate);
  return {
    name: profile.name ?? '',
    surname: profile.surname ?? '',
    email: profile.email ?? '',
    phone: profile.phone ? extractTurkishNationalNumber(profile.phone) : '',
    gender: profile.gender ?? '',
    day: parts.day,
    month: parts.month,
    year: parts.year,
  };
}

/** Editable "Kullanıcı Bilgilerim" form mirroring the web profile editor. */
export function UserInfoForm({ profile }: UserInfoFormProps) {
  const updateProfile = useUpdateProfileMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: buildDefaults(profile),
  });

  // This screen stays mounted as a hidden tab route, so unsaved edits would survive
  // navigating away and back. Reset to the saved profile each time it regains focus
  // to discard any uncommitted changes.
  useFocusEffect(
    useCallback(() => {
      reset(buildDefaults(profile));
    }, [profile, reset]),
  );

  const onSubmit = async (data: UserInfoFormData) => {
    setServerError(null);
    const nationalPhone = data.phone.replace(/\D/g, '');
    try {
      await updateProfile.mutateAsync({
        name: data.name.trim(),
        surname: data.surname.trim(),
        email: data.email.trim(),
        phone: nationalPhone || null,
        birth_date: combineBirthDate({ day: data.day, month: data.month, year: data.year }),
        gender: data.gender || null,
      });
      Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Bilgiler güncellenirken bir hata oluştu.';
      setServerError(message);
    }
  };

  const showVerifyNote = Boolean(profile.email) && profile.emailVerified === false;

  return (
    <YStack gap="$4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            backgroundColor="$color1"
            errorMessage={errors.name?.message}
            id="user-info-name"
            label="Ad"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Adınız"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="surname"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            backgroundColor="$color1"
            errorMessage={errors.surname?.message}
            id="user-info-surname"
            label="Soyad"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Soyadınız"
            value={value}
          />
        )}
      />

      <YStack gap="$1">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              autoCapitalize="none"
              backgroundColor="$color1"
              errorMessage={errors.email?.message}
              id="user-info-email"
              keyboardType="email-address"
              label="E-posta"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {showVerifyNote ? (
          <Paragraph color="$yellow10" fontSize={12}>
            E-postanız doğrulanmamış.
          </Paragraph>
        ) : null}
      </YStack>

      {/* Phone + country code are read-only here (changing the login number needs a
          separate verification flow), matching the web profile editor. */}
      <YStack gap="$2">
        <Paragraph color="$color" fontSize={14} fontWeight="600">
          Telefon Numarası
        </Paragraph>
        <Controller
          control={control}
          name="phone"
          render={({ field: { value } }) => (
            <XStack gap="$2">
              <ReadOnlyField width={92}>+90</ReadOnlyField>
              <ReadOnlyField flex={1}>
                {value ? formatTurkishPhoneDisplay(value) : '-'}
              </ReadOnlyField>
            </XStack>
          )}
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph color="$color" fontSize={14} fontWeight="600">
          Doğum Tarihi
        </Paragraph>
        <XStack gap="$2">
          <YStack flex={1}>
            <Controller
              control={control}
              name="day"
              render={({ field: { onChange, value } }) => (
                <AppSelect
                  label="Gün"
                  onValueChange={(next) => onChange(String(next))}
                  options={DAY_OPTIONS}
                  placeholder="Gün"
                  value={value || null}
                />
              )}
            />
          </YStack>
          <YStack flex={1.4}>
            <Controller
              control={control}
              name="month"
              render={({ field: { onChange, value } }) => (
                <AppSelect
                  label="Ay"
                  onValueChange={(next) => onChange(String(next))}
                  options={MONTH_OPTIONS}
                  placeholder="Ay"
                  value={value || null}
                />
              )}
            />
          </YStack>
          <YStack flex={1.1}>
            <Controller
              control={control}
              name="year"
              render={({ field: { onChange, value } }) => (
                <AppSelect
                  label="Yıl"
                  onValueChange={(next) => onChange(String(next))}
                  options={YEAR_OPTIONS}
                  placeholder="Yıl"
                  searchable
                  value={value || null}
                />
              )}
            />
          </YStack>
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Paragraph color="$color" fontSize={14} fontWeight="600">
          Cinsiyet
        </Paragraph>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <AppSelect
              label="Cinsiyet"
              onValueChange={(next) => onChange(String(next))}
              options={GENDER_OPTIONS}
              placeholder="Seçiniz"
              value={value || null}
            />
          )}
        />
      </YStack>

      {serverError ? (
        <Paragraph color="$red10" fontSize={13} fontWeight="500" textAlign="center">
          {serverError}
        </Paragraph>
      ) : null}

      <AppButton
        backgroundColor="$brand"
        borderColor="transparent"
        color="white"
        disabled={isSubmitting}
        id="user-info-submit"
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Kaydet'}
      </AppButton>
    </YStack>
  );
}
