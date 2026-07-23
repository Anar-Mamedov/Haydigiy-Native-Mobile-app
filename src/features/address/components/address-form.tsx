import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { AppButton, AppInput, AppSelect, SegmentedControl } from '@/components/ui';
import { formatTurkishPhoneDisplay, sanitizeTurkishMobileInput } from '@/utils/turkish-phone';
import { NewAddressInput } from '@/services/address.service';
import { AddressFormValues } from '@/types/address.types';
import { addressSchema, AddressFormData, INVOICE_TYPE_OPTIONS } from '../schemas/address.schema';
import {
  useCitiesQuery,
  useDistrictsQuery,
  useNeighbourhoodsQuery,
} from '../api/address.queries';
import { useAddAddressMutation, useUpdateAddressMutation } from '../api/address.mutations';
import { ADDRESS_TITLES } from '../utils/address-title';
import { InvoiceFields } from './invoice-fields';

const PHONE_DISPLAY_MAX_LENGTH = 14;
const ADDRESS_TITLE_OPTIONS = ADDRESS_TITLES.map((title) => ({ label: title, value: title }));

/** Blank form values; the create screen clones this and prefills user details. */
export const EMPTY_ADDRESS_VALUES: AddressFormValues = {
  title: '',
  name: '',
  surname: '',
  phone: '',
  tcNumber: '',
  cityId: '',
  districtId: '',
  neighbourhoodId: '',
  addressLine: '',
  invoiceType: 'individual',
  taxNumber: '',
  taxOffice: '',
  companyName: '',
  isEFatura: false,
};

type AddressFormProps = {
  mode: 'create' | 'edit';
  addressId?: string;
  initialValues?: AddressFormValues;
  onSuccess: () => void;
};

/**
 * Shared add/edit address form mirroring the web mobile address form: cascading
 * İl → İlçe → Mahalle selects, optional T.C. number and the Bireysel/Kurumsal
 * invoice toggle with corporate fields.
 */
export function AddressForm({ mode, addressId, initialValues, onSuccess }: AddressFormProps) {
  const addMutation = useAddAddressMutation();
  const updateMutation = useUpdateAddressMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues ?? EMPTY_ADDRESS_VALUES,
  });

  // This screen stays mounted as a hidden tab route, so unsaved edits would
  // survive navigating away and back. Reset to the latest `initialValues` (the
  // user prefill for create, or the freshly refetched API data for edit) each
  // time the screen regains focus so no stale, uncommitted input remains.
  // `initialValues` is kept referentially stable by the caller so this only
  // re-runs on real focus changes or when the fetched data actually changes.
  useFocusEffect(
    useCallback(() => {
      reset(initialValues ?? EMPTY_ADDRESS_VALUES);
      setServerError(null);
    }, [initialValues, reset]),
  );

  const cityId = watch('cityId');
  const districtId = watch('districtId');
  const invoiceType = watch('invoiceType');

  const citiesQuery = useCitiesQuery();
  const districtsQuery = useDistrictsQuery(cityId);
  const neighbourhoodsQuery = useNeighbourhoodsQuery(districtId);

  const onSubmit = async (data: AddressFormData) => {
    setServerError(null);
    const isCorporate = data.invoiceType === 'corporate';
    const input: NewAddressInput = {
      title: data.title.trim(),
      name: data.name.trim(),
      surname: data.surname.trim(),
      phone: `0${data.phone}`,
      tcNumber: data.tcNumber.trim() || undefined,
      cityId: data.cityId,
      districtId: data.districtId,
      neighbourhoodId: data.neighbourhoodId,
      addressLine: data.addressLine.trim(),
      invoiceType: data.invoiceType,
      taxNumber: isCorporate ? data.taxNumber.trim() : undefined,
      taxOffice: isCorporate ? data.taxOffice.trim() : undefined,
      companyName: isCorporate ? data.companyName.trim() : undefined,
      isEFatura: isCorporate ? data.isEFatura : false,
    };

    try {
      if (mode === 'edit' && addressId) {
        await updateMutation.mutateAsync({ id: addressId, input });
      } else {
        await addMutation.mutateAsync(input);
      }
      onSuccess();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (mode === 'edit' ? 'Adres güncellenirken bir hata oluştu.' : 'Adres eklenirken bir hata oluştu.');
      setServerError(message);
    }
  };

  return (
    <YStack gap="$4">
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <AppSelect
            errorMessage={errors.title?.message}
            label="Adres Başlığı *"
            onValueChange={(next) => onChange(String(next))}
            options={ADDRESS_TITLE_OPTIONS}
            placeholder="Seçiniz"
            value={value || null}
          />
        )}
      />

      <XStack gap="$3">
        <YStack flex={1}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                errorMessage={errors.name?.message}
                label="Ad *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Adınız"
                value={value}
              />
            )}
          />
        </YStack>
        <YStack flex={1}>
          <Controller
            control={control}
            name="surname"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                errorMessage={errors.surname?.message}
                label="Soyad *"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Soyadınız"
                value={value}
              />
            )}
          />
        </YStack>
      </XStack>

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            errorMessage={errors.phone?.message}
            keyboardType="phone-pad"
            label="Telefon *"
            maxLength={PHONE_DISPLAY_MAX_LENGTH}
            onBlur={onBlur}
            onChangeText={(text) => onChange(sanitizeTurkishMobileInput(text))}
            placeholder="05XX XXX XX XX"
            textContentType="telephoneNumber"
            value={formatTurkishPhoneDisplay(value)}
          />
        )}
      />

      <Controller
        control={control}
        name="tcNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            errorMessage={errors.tcNumber?.message}
            keyboardType="number-pad"
            label="T.C. Kimlik No (Zorunlu değil)"
            maxLength={11}
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.replace(/\D/g, ''))}
            placeholder="11 haneli T.C. Kimlik No"
            value={value}
          />
        )}
      />

      <XStack gap="$3">
        <YStack flex={1}>
          <Controller
            control={control}
            name="cityId"
            render={({ field: { onChange, value } }) => (
              <AppSelect
                errorMessage={errors.cityId?.message}
                label="İl *"
                loading={citiesQuery.isPending}
                onValueChange={(next) => {
                  onChange(String(next));
                  setValue('districtId', '', { shouldValidate: false });
                  setValue('neighbourhoodId', '', { shouldValidate: false });
                }}
                options={(citiesQuery.data ?? []).map((city) => ({ label: city.name, value: city.id }))}
                placeholder="İl seçin"
                searchable
                value={value || null}
              />
            )}
          />
        </YStack>
        <YStack flex={1}>
          <Controller
            control={control}
            name="districtId"
            render={({ field: { onChange, value } }) => (
              <AppSelect
                disabled={!cityId}
                errorMessage={errors.districtId?.message}
                label="İlçe *"
                loading={districtsQuery.isFetching}
                onValueChange={(next) => {
                  onChange(String(next));
                  setValue('neighbourhoodId', '', { shouldValidate: false });
                }}
                options={(districtsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))}
                placeholder="İlçe seçin"
                searchable
                value={value || null}
              />
            )}
          />
        </YStack>
      </XStack>

      <Controller
        control={control}
        name="neighbourhoodId"
        render={({ field: { onChange, value } }) => (
          <AppSelect
            disabled={!districtId}
            errorMessage={errors.neighbourhoodId?.message}
            label="Mahalle *"
            loading={neighbourhoodsQuery.isFetching}
            onValueChange={(next) => onChange(String(next))}
            options={(neighbourhoodsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))}
            placeholder="Mahalle seçin"
            searchable
            value={value || null}
          />
        )}
      />

      <Controller
        control={control}
        name="addressLine"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppInput
            errorMessage={errors.addressLine?.message}
            helperText="Kargonuzun size sorunsuz ulaşması için mahalle, cadde, sokak, bina gibi detayları eksiksiz girin."
            label="Adres *"
            multiline
            numberOfLines={3}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Cadde, mahalle, sokak ve diğer bilgileri giriniz."
            value={value}
          />
        )}
      />

      <YStack gap="$2">
        <Paragraph color="$color" fontSize={14} fontWeight="600">
          Fatura Türü *
        </Paragraph>
        <Controller
          control={control}
          name="invoiceType"
          render={({ field: { onChange, value } }) => (
            <SegmentedControl onChange={onChange} options={INVOICE_TYPE_OPTIONS} value={value} />
          )}
        />
      </YStack>

      {invoiceType === 'corporate' ? <InvoiceFields control={control} errors={errors} /> : null}

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
        id="address-submit"
        onPress={handleSubmit(onSubmit)}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting ? <Spinner color="white" /> : 'Kaydet'}
      </AppButton>
    </YStack>
  );
}
