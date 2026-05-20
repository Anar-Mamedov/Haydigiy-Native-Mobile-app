import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Paragraph, YStack } from 'tamagui';
import { AppButton, AppInput, SectionCard } from '@/components/ui';
import {
  CheckoutFormValues,
  checkoutSchema,
} from '@/features/checkout/schemas/checkout.schema';

export function CheckoutContactForm() {
  const [submittedSnapshot, setSubmittedSnapshot] = useState<CheckoutFormValues | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      addressLine: '',
      email: '',
      fullName: '',
    },
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmittedSnapshot(values);
  });

  return (
    <SectionCard>
      <YStack gap="$4">
        <YStack gap="$1">
          <Paragraph fontSize="$6" fontWeight="700">
            Delivery contact
          </Paragraph>
          <Paragraph color="$color10">
            React Hook Form + Zod starter for the checkout flow.
          </Paragraph>
        </YStack>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              errorMessage={errors.fullName?.message}
              label="Full name"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Jane Doe"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              autoCapitalize="none"
              autoCorrect={false}
              errorMessage={errors.email?.message}
              keyboardType="email-address"
              label="Email address"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="jane@example.com"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="addressLine"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              errorMessage={errors.addressLine?.message}
              label="Delivery address"
              multiline
              numberOfLines={4}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Street, building, district, city"
              value={value}
            />
          )}
        />

        <AppButton disabled={isSubmitting} onPress={() => void onSubmit()}>
          Continue payment flow
        </AppButton>

        {submittedSnapshot ? (
          <Paragraph color="$color10" size="$2">
            Draft captured for {submittedSnapshot.fullName}. Connect this form to checkout
            mutation flow next.
          </Paragraph>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
