import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ExpoRouter from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton, AppInput, AppSelect } from '@/components/ui';
import {
  extractTurkishNationalNumber,
  formatTurkishPhoneDisplay,
  sanitizeTurkishMobileInput,
} from '@/utils/turkish-phone';
import { UserProfile } from '../api/profile.mapper';
import { useProfileUpdate } from '../hooks/use-profile-update';
import {
  GENDER_OPTIONS,
  userInfoSchema,
  UserInfoFormData,
} from '../schemas/user-info.schema';
import {
  getDayOptions,
  getMonthOptions,
  getYearOptions,
  splitBirthDate,
} from '../utils/birth-date';
import { parseProfileUpdateError } from '../utils/profile-update-error';
import {
  buildProfileUpdatePayload,
  isProfilePhoneRequired,
  PHONE_REQUIRED_MESSAGE,
} from '../utils/profile-update-payload';
import { toPersonName } from '@/utils/normalize-text';
import { PhoneChangeVerificationSheet } from './phone-change-verification-sheet';

// [UI-DEBUG] GEÇİCİ teşhis logu — sorun bulununca silinecek.
const uiDebugIds = new WeakMap<object, number>();
let uiDebugNextId = 1;
export function uiDebugId(value: object | null | undefined): number {
  if (!value) return 0;
  let id = uiDebugIds.get(value);
  if (!id) {
    id = uiDebugNextId++;
    uiDebugIds.set(value, id);
  }
  return id;
}

const DAY_OPTIONS = getDayOptions();
const MONTH_OPTIONS = getMonthOptions();
const YEAR_OPTIONS = getYearOptions();

const PHONE_CHANGE_HINT = 'Numaranızı değiştirirseniz yeni numaranıza doğrulama kodu gönderilir.';

type UserInfoFormProps = {
  profile: UserProfile;
};

type ReadOnlyFieldProps = {
  accessibilityLabel: string;
  children: string;
  flex?: number;
  width?: number;
};

/** Input-shaped box for a value this form shows but never edits. */
function ReadOnlyField({ accessibilityLabel, children, flex, width }: ReadOnlyFieldProps) {
  return (
    <XStack
      accessibilityLabel={accessibilityLabel}
      accessible
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

/** Fixed country code shown beside the national phone number. */
function CountryCodeField() {
  return (
    <ReadOnlyField accessibilityLabel="Ülke kodu +90" width={92}>
      +90
    </ReadOnlyField>
  );
}

function buildDefaults(profile: UserProfile): UserInfoFormData {
  const parts = splitBirthDate(profile.birthDate);
  return {
    name: profile.name ?? '',
    surname: profile.surname ?? '',
    email: profile.email ?? '',
    // Edited as the national number; an unchanged one is sent back exactly as saved
    // (see `buildProfileUpdatePayload`).
    phone: profile.phone ? extractTurkishNationalNumber(profile.phone) : '',
    gender: profile.gender ?? '',
    day: parts.day,
    month: parts.month,
    year: parts.year,
  };
}

/** Editable "Kullanıcı Bilgilerim" form mirroring the web profile editor. */
export function UserInfoForm({ profile }: UserInfoFormProps) {
  const profileUpdate = useProfileUpdate({
    onPhoneVerified: () =>
      Alert.alert('Başarılı', 'Telefon numaranız doğrulandı ve bilgileriniz güncellendi.'),
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserInfoFormData>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: buildDefaults(profile),
  });

  // This screen stays mounted as a hidden tab route, so unsaved edits would survive
  // navigating away and back. Reset to the saved profile each time it regains focus
  // to discard any uncommitted changes.
  // [UI-DEBUG] GEÇİCİ
  // Testlerdeki expo-router mock'unda useNavigation yok; orada atlanır.
  const uiDebugNavigation = ExpoRouter.useNavigation?.();
  const uiDebugRenders = useRef(0);
  uiDebugRenders.current += 1;
  console.log(
    '[UI-DEBUG] form render',
    uiDebugRenders.current,
    'profile#',
    uiDebugId(profile),
    'nav#',
    uiDebugId(uiDebugNavigation),
  );
  useEffect(() => {
    console.log('[UI-DEBUG] form MOUNT');
    return () => console.log('[UI-DEBUG] form UNMOUNT');
  }, []);
  useEffect(() => {
    if (!uiDebugNavigation) return;
    const offFocus = uiDebugNavigation.addListener('focus', () =>
      console.log('[UI-DEBUG] nav FOCUS event'),
    );
    const offBlur = uiDebugNavigation.addListener('blur', () =>
      console.log('[UI-DEBUG] nav BLUR event'),
    );
    return () => {
      offFocus();
      offBlur();
    };
  }, [uiDebugNavigation]);

  useFocusEffect(
    useCallback(() => {
      console.log('[UI-DEBUG] focus-reset RUN profile#', uiDebugId(profile));
      reset(buildDefaults(profile));
    }, [profile, reset]),
  );

  const onSubmit = async (data: UserInfoFormData) => {
    setServerError(null);

    // A saved number may be replaced (after an SMS code) but never cleared from here.
    if (isProfilePhoneRequired(profile) && !data.phone.trim()) {
      setError('phone', { message: PHONE_REQUIRED_MESSAGE, type: 'required' }, { shouldFocus: true });
      return;
    }

    try {
      const outcome = await profileUpdate.save(buildProfileUpdatePayload(data, profile));
      // Otherwise the code sheet is open: the form is saved together with the code.
      if (outcome === 'saved') Alert.alert('Başarılı', 'Bilgileriniz güncellendi.');
    } catch (error: unknown) {
      const updateError = parseProfileUpdateError(error);
      if (updateError.phoneMessage) {
        setError(
          'phone',
          { message: updateError.phoneMessage, type: 'server' },
          { shouldFocus: true },
        );
        return;
      }
      setServerError(updateError.message);
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
            onChangeText={(text) => {
              console.log('[UI-DEBUG] name onChangeText', JSON.stringify(text), 'value was', JSON.stringify(value));
              onChange(toPersonName(text));
            }}
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
            onChangeText={(text) => onChange(toPersonName(text))}
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

      <YStack gap="$2">
        <Paragraph color="$color" fontSize={14} fontWeight="600">
          Telefon Numarası
        </Paragraph>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <XStack alignItems="flex-start" gap="$2">
              <CountryCodeField />
              <YStack flex={1}>
                <AppInput
                  backgroundColor="$color1"
                  errorMessage={errors.phone?.message}
                  height={48}
                  helperText={PHONE_CHANGE_HINT}
                  hideVisibleLabel
                  id="user-info-phone"
                  keyboardType="phone-pad"
                  label="Telefon Numarası"
                  maxLength={14}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(sanitizeTurkishMobileInput(text))}
                  placeholder="05XX XXX XX XX"
                  textContentType="telephoneNumber"
                  value={formatTurkishPhoneDisplay(value)}
                />
              </YStack>
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
                  onClear={() => onChange('')}
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
                  onClear={() => onChange('')}
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
                  onClear={() => onChange('')}
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
        {errors.day?.message ? (
          <Paragraph color="$red10" size="$2">
            {errors.day.message}
          </Paragraph>
        ) : null}
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
              onClear={() => onChange('')}
              onValueChange={(next) => {
                console.log('[UI-DEBUG] gender onValueChange', next, 'value was', value);
                onChange(String(next));
              }}
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
        disabled={isSubmitting || profileUpdate.isVerificationOpen}
        id="user-info-submit"
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Kaydet'}
      </AppButton>

      <PhoneChangeVerificationSheet
        code={profileUpdate.code}
        cooldownSeconds={profileUpdate.cooldownSeconds}
        errorMessage={profileUpdate.errorMessage}
        infoMessage={profileUpdate.infoMessage}
        isResending={profileUpdate.isResending}
        isVerifying={profileUpdate.isVerifying}
        onCancel={profileUpdate.cancelVerification}
        onChangeCode={profileUpdate.setCode}
        onResend={() => void profileUpdate.resendCode()}
        onSubmit={() => void profileUpdate.submitCode()}
        open={profileUpdate.isVerificationOpen}
        phone={profileUpdate.pendingPhone}
      />
    </YStack>
  );
}
