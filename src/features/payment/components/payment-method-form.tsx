import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton, AppCheckbox, AppInput } from '@/components/ui';
import { formatIbanInput, getIbanDigits, normalizeIban } from '@/utils/iban';
import { PaymentMethodInput } from '@/services/payment.service';
import { paymentMethodSchema, PaymentMethodFormData } from '../schemas/payment-method.schema';
import {
  useAddPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
} from '../api/payment.mutations';

const IBAN_DISPLAY_MAX_LENGTH = 32; // "TR" + 24 digits + 6 grouping spaces
const NAME_FILTER = /[^a-zA-ZçğıöşüÇĞIİÖŞÜ\s]/g;

/** Blank form values; new IBANs default to being the user's default IBAN. */
export const EMPTY_PAYMENT_VALUES: PaymentMethodFormData = {
  iban: '',
  ibanName: '',
  isDefault: true,
};

type PaymentMethodFormProps = {
  mode: 'create' | 'edit';
  methodId?: number;
  initialValues?: PaymentMethodFormData;
  onSuccess: () => void;
};

/** Shared add/edit IBAN form mirroring the web payment-method modal. */
export function PaymentMethodForm({
  mode,
  methodId,
  initialValues,
  onSuccess,
}: PaymentMethodFormProps) {
  const addMutation = useAddPaymentMethodMutation();
  const updateMutation = useUpdatePaymentMethodMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: initialValues ?? EMPTY_PAYMENT_VALUES,
  });

  // Hidden tab route stays mounted, so reset to the latest values on focus to
  // drop any stale, uncommitted input from a previous visit.
  useFocusEffect(
    useCallback(() => {
      reset(initialValues ?? EMPTY_PAYMENT_VALUES);
      setServerError(null);
    }, [initialValues, reset]),
  );

  const onSubmit = async (data: PaymentMethodFormData) => {
    setServerError(null);
    const input: PaymentMethodInput = {
      iban: normalizeIban(data.iban),
      ibanName: data.ibanName.trim(),
      isDefault: data.isDefault,
    };
    try {
      if (mode === 'edit' && methodId != null) {
        await updateMutation.mutateAsync({ id: methodId, input });
      } else {
        await addMutation.mutateAsync(input);
      }
      onSuccess();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (mode === 'edit' ? 'IBAN güncellenirken bir hata oluştu.' : 'IBAN eklenirken bir hata oluştu.');
      setServerError(message);
    }
  };

  return (
    <YStack gap="$4">
      <Controller
        control={control}
        name="iban"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            autoCapitalize="characters"
            errorMessage={errors.iban?.message}
            helperText="IBAN TR ile başlamalı ve TR'den sonra 24 rakam olmalıdır. Boşluklar otomatik eklenir."
            keyboardType="number-pad"
            label="IBAN *"
            maxLength={IBAN_DISPLAY_MAX_LENGTH}
            onBlur={onBlur}
            onChangeText={(text) => onChange(getIbanDigits(text))}
            placeholder="TR33 0001 0000 0000 0000 0000 00"
            value={formatIbanInput(value)}
          />
        )}
      />

      <Controller
        control={control}
        name="ibanName"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            errorMessage={errors.ibanName?.message}
            helperText="Sadece harf ve boşluk karakterleri kabul edilir."
            label="IBAN Sahibi Adı *"
            maxLength={100}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.replace(NAME_FILTER, ''))}
            placeholder="Ad Soyad"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="isDefault"
        render={({ field: { onChange, value } }) => (
          <AppCheckbox
            accessibilityLabel="Varsayılan IBAN olarak ayarla"
            checked={value}
            onChange={() => onChange(!value)}
          >
            <Paragraph color="$color" fontSize={14}>
              Varsayılan IBAN olarak ayarla
            </Paragraph>
          </AppCheckbox>
        )}
      />

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
        id="payment-method-submit"
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Kaydet'}
      </AppButton>
    </YStack>
  );
}
