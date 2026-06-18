import { useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { AppCheckbox, AppInput, AppSelect } from '@/components/ui';
import {
  useCitiesQuery,
  useDistrictsQuery,
  useNeighbourhoodsQuery,
} from '../api/return.queries';
import { useAddAddressMutation } from '../api/return.mutations';
import { getReturnErrorMessage } from '@/services/return.service';
import { AddressInvoiceType } from '@/services/address.service';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('0') ? digits : `0${digits}`;
};

/** Full-screen "Adres Ekle" modal for the return pickup flow (`POST /addresses`). */
export function AddressAddModal({ open, onClose, onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [neighbourhoodId, setNeighbourhoodId] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [invoiceType, setInvoiceType] = useState<AddressInvoiceType>('individual');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isEFatura, setIsEFatura] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const citiesQuery = useCitiesQuery(open);
  const districtsQuery = useDistrictsQuery(cityId);
  const neighbourhoodsQuery = useNeighbourhoodsQuery(districtId);
  const addMutation = useAddAddressMutation();

  const reset = () => {
    setTitle('');
    setName('');
    setSurname('');
    setPhone('');
    setTcNumber('');
    setCityId('');
    setDistrictId('');
    setNeighbourhoodId('');
    setAddressLine('');
    setInvoiceType('individual');
    setTaxNumber('');
    setTaxOffice('');
    setCompanyName('');
    setIsEFatura(false);
    setError(null);
  };

  const handleClose = () => {
    if (addMutation.isPending) return;
    reset();
    onClose();
  };

  const handleCityChange = (value: string) => {
    setCityId(value);
    setDistrictId('');
    setNeighbourhoodId('');
  };

  const handleDistrictChange = (value: string) => {
    setDistrictId(value);
    setNeighbourhoodId('');
  };

  const handleSubmit = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (
      !title.trim() ||
      !name.trim() ||
      !surname.trim() ||
      !cityId ||
      !districtId ||
      !neighbourhoodId ||
      !addressLine.trim()
    ) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (normalizedPhone.length < 11) {
      setError('Geçerli bir telefon numarası giriniz.');
      return;
    }
    if (invoiceType === 'corporate' && (!taxNumber.trim() || !taxOffice.trim() || !companyName.trim())) {
      setError('Kurumsal fatura için VKN/TCKN, Vergi Dairesi ve Firma Adı zorunludur.');
      return;
    }
    setError(null);
    try {
      await addMutation.mutateAsync({
        title: title.trim(),
        name: name.trim(),
        surname: surname.trim(),
        phone: normalizedPhone,
        tcNumber: tcNumber.trim() || undefined,
        cityId,
        districtId,
        neighbourhoodId,
        addressLine: addressLine.trim(),
        invoiceType,
        taxNumber: invoiceType === 'corporate' ? taxNumber.trim() : undefined,
        taxOffice: invoiceType === 'corporate' ? taxOffice.trim() : undefined,
        companyName: invoiceType === 'corporate' ? companyName.trim() : undefined,
        isEFatura: invoiceType === 'corporate' ? isEFatura : false,
      });
      reset();
      onSuccess();
    } catch (submitError) {
      setError(getReturnErrorMessage(submitError, 'Adres eklenemedi.'));
    }
  };

  return (
    <Sheet
      disableDrag
      modal
      onOpenChange={(next: boolean) => !next && handleClose()}
      open={open}
      snapPoints={[100]}
      snapPointsMode="percent"
    >
      <Sheet.Overlay backgroundColor="$shadowColor" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} opacity={0.5} />
      <Sheet.Frame backgroundColor="$background">
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingBottom="$3"
          paddingHorizontal="$4"
          paddingTop={insets.top + 12}
        >
          <Paragraph color="$color" fontSize={18} fontWeight="800">
            Adres Ekle
          </Paragraph>
          <Pressable
            accessibilityLabel="Kapat"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleClose}
            style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <X color="$color" size={24} />
          </Pressable>
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <AppInput label="Adres Başlığı *" onChangeText={setTitle} placeholder="Ev, İş, vb." value={title} />
          <XStack gap="$3">
            <YStack flex={1}>
              <AppInput label="Ad *" onChangeText={setName} placeholder="Ad" value={name} />
            </YStack>
            <YStack flex={1}>
              <AppInput label="Soyad *" onChangeText={setSurname} placeholder="Soyad" value={surname} />
            </YStack>
          </XStack>
          <AppInput
            keyboardType="phone-pad"
            label="Telefon *"
            onChangeText={setPhone}
            placeholder="05XX XXX XX XX"
            value={phone}
          />
          <AppInput
            keyboardType="number-pad"
            label="T.C. Kimlik No (Zorunlu değil)"
            maxLength={11}
            onChangeText={(text) => setTcNumber(text.replace(/\D/g, ''))}
            placeholder="11 haneli T.C. Kimlik No"
            value={tcNumber}
          />
          <YStack gap="$1.5">
            <Paragraph color="$color10" fontSize={12}>
              İl *
            </Paragraph>
            <AppSelect
              label="İl"
              loading={citiesQuery.isPending}
              onValueChange={(value) => handleCityChange(String(value))}
              options={(citiesQuery.data ?? []).map((city) => ({ label: city.name, value: city.id }))}
              placeholder="İl seçin"
              searchable
              value={cityId || null}
            />
          </YStack>
          <YStack gap="$1.5">
            <Paragraph color="$color10" fontSize={12}>
              İlçe *
            </Paragraph>
            <AppSelect
              disabled={!cityId}
              label="İlçe"
              loading={districtsQuery.isFetching}
              onValueChange={(value) => handleDistrictChange(String(value))}
              options={(districtsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))}
              placeholder="İlçe seçin"
              searchable
              value={districtId || null}
            />
          </YStack>
          <YStack gap="$1.5">
            <Paragraph color="$color10" fontSize={12}>
              Mahalle *
            </Paragraph>
            <AppSelect
              disabled={!districtId}
              label="Mahalle"
              loading={neighbourhoodsQuery.isFetching}
              onValueChange={(value) => setNeighbourhoodId(String(value))}
              options={(neighbourhoodsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))}
              placeholder="Mahalle seçin"
              searchable
              value={neighbourhoodId || null}
            />
          </YStack>
          <AppInput
            helperText="Kargonuzun size sorunsuz ulaşması için mahalle, cadde, sokak, bina gibi detayları eksiksiz girin."
            label="Adres *"
            multiline
            numberOfLines={3}
            onChangeText={setAddressLine}
            placeholder="Cadde, mahalle, sokak ve diğer bilgileri giriniz."
            value={addressLine}
          />

          <YStack gap="$2">
            <Paragraph color="$color" fontSize={13} fontWeight="700">
              Fatura Türü *
            </Paragraph>
            <XStack
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              overflow="hidden"
            >
              {(['individual', 'corporate'] as const).map((type) => {
                const active = invoiceType === type;
                return (
                  <XStack
                    accessibilityLabel={type === 'individual' ? 'Bireysel' : 'Kurumsal'}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    alignItems="center"
                    backgroundColor={active ? '$orange3' : '$background'}
                    flex={1}
                    height={44}
                    justifyContent="center"
                    key={type}
                    onPress={() => setInvoiceType(type)}
                    pressStyle={{ opacity: 0.85 }}
                  >
                    <Paragraph color={active ? '$brand' : '$color'} fontSize={14} fontWeight="700">
                      {type === 'individual' ? 'Bireysel' : 'Kurumsal'}
                    </Paragraph>
                  </XStack>
                );
              })}
            </XStack>
          </YStack>

          {invoiceType === 'corporate' ? (
            <>
              <XStack gap="$3">
                <YStack flex={1}>
                  <AppInput
                    keyboardType="number-pad"
                    label="VKN/TCKN *"
                    onChangeText={(text) => setTaxNumber(text.replace(/\D/g, ''))}
                    placeholder="VKN/TCKN Giriniz"
                    value={taxNumber}
                  />
                </YStack>
                <YStack flex={1}>
                  <AppInput
                    label="Vergi Dairesi *"
                    onChangeText={setTaxOffice}
                    placeholder="Vergi Dairesi Giriniz"
                    value={taxOffice}
                  />
                </YStack>
              </XStack>
              <AppInput
                label="Firma Adı *"
                onChangeText={setCompanyName}
                placeholder="Firma Adı Giriniz"
                value={companyName}
              />
              <AppCheckbox
                accessibilityLabel="E-fatura mükellefiyim"
                checked={isEFatura}
                onChange={() => setIsEFatura((prev) => !prev)}
              >
                <Paragraph color="$color" fontSize={13}>
                  E-fatura mükellefiyim
                </Paragraph>
              </AppCheckbox>
            </>
          ) : null}

          {error ? (
            <Paragraph color="$red10" fontSize={12}>
              {error}
            </Paragraph>
          ) : null}
        </ScrollView>

        <YStack
          borderTopColor="$borderColor"
          borderTopWidth={1}
          padding="$4"
          paddingBottom={Math.max(insets.bottom, 16)}
        >
          <Button
            accessibilityLabel="Adresi kaydet"
            backgroundColor="$brand"
            borderRadius="$4"
            disabled={addMutation.isPending}
            height={48}
            onPress={handleSubmit}
            opacity={addMutation.isPending ? 0.7 : 1}
            pressStyle={{ opacity: 0.85 }}
          >
            <Paragraph color="white" fontSize={15} fontWeight="700">
              {addMutation.isPending ? 'Kaydediliyor...' : 'Adresi Kaydet'}
            </Paragraph>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
