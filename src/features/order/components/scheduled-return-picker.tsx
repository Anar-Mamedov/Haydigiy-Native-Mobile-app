import { useRouter } from 'expo-router';
import { CalendarDays, Check } from '@tamagui/lucide-icons-2';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { AppSelect } from '@/components/ui';
import { formatPickupDate, UseScheduledReturn } from '../hooks/use-scheduled-return';
import { SavedAddress } from '@/types/order.types';

type Props = { sr: UseScheduledReturn };

function SavedAddressCard({
  address,
  selected,
  onPress,
}: {
  address: SavedAddress;
  selected: boolean;
  onPress: () => void;
}) {
  const location = [address.district, address.city].filter(Boolean).join(' / ');
  return (
    <XStack
      accessibilityLabel={address.title}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      alignItems="flex-start"
      backgroundColor={selected ? '$backgroundHover' : '$background'}
      borderColor={selected ? '$brand' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      onPress={onPress}
      padding="$3"
      pressStyle={{ backgroundColor: '$backgroundHover' }}
    >
      <XStack
        alignItems="center"
        backgroundColor={selected ? '$brand' : 'transparent'}
        borderColor={selected ? '$brand' : '$color8'}
        borderRadius={100}
        borderWidth={1}
        height={18}
        justifyContent="center"
        marginTop={2}
        width={18}
      >
        {selected ? <Check color="white" size={12} /> : null}
      </XStack>
      <YStack flex={1} gap="$1">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          {address.title}
        </Paragraph>
        <Paragraph color="$color10" fontSize={12} numberOfLines={2}>
          {address.addressLine} {location ? `/ ${location}` : ''}
        </Paragraph>
      </YStack>
    </XStack>
  );
}

/**
 * Address + date picker for the Hepsijet scheduled return (home pickup). Lists the
 * user's saved addresses, opens the shared full-screen address form to add a new
 * one, then lets them query bookable days and pick a pickup day — mirroring the
 * web ScheduledReturnPicker.
 */
export function ScheduledReturnPicker({ sr }: Props) {
  const router = useRouter();

  const goToAddAddress = () => {
    router.push('/(tabs)/address-form');
  };

  return (
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Paragraph color="$color" fontSize={13} fontWeight="700">
          Kayıtlı Adreslerim
        </Paragraph>
        <Paragraph
          accessibilityLabel="Yeni Adres Ekle"
          accessibilityRole="button"
          color="$brand"
          fontSize={13}
          fontWeight="700"
          onPress={goToAddAddress}
          pressStyle={{ opacity: 0.7 }}
        >
          + Yeni Adres Ekle
        </Paragraph>
      </XStack>

      <YStack gap="$2">
        {sr.savedLoading ? (
          <XStack alignItems="center" gap="$2" padding="$2">
            <Spinner color="$brand" size="small" />
            <Paragraph color="$color10" fontSize={13}>
              Adresler yükleniyor...
            </Paragraph>
          </XStack>
        ) : sr.savedAddresses.length === 0 ? (
          <YStack backgroundColor="$red2" borderColor="$red6" borderRadius="$4" borderWidth={1} padding="$3">
            <Paragraph color="$red11" fontSize={13} fontWeight="600">
              Kayıtlı adresiniz bulunamadı. Yeni Adres Ekle ile bir adres girin veya diğer iade
              yöntemini kullanın.
            </Paragraph>
          </YStack>
        ) : (
          sr.savedAddresses.map((address) => (
            <SavedAddressCard
              address={address}
              key={address.id}
              onPress={() => sr.setSelectedAddressId(address.id)}
              selected={sr.selectedAddressId === address.id}
            />
          ))
        )}
      </YStack>

      <YStack borderColor="$borderColor" borderRadius="$4" borderWidth={1} gap="$3" padding="$3">
        <XStack alignItems="center" gap="$2">
          <CalendarDays color="$brand" size={16} />
          <Paragraph color="$color" fontSize={13} fontWeight="700">
            Alım Tarih Aralığı
          </Paragraph>
        </XStack>
        <XStack gap="$3">
          <YStack flex={1} gap="$1">
            <Paragraph color="$color10" fontSize={12}>
              Başlangıç
            </Paragraph>
            <AppSelect
              label="Başlangıç tarihi"
              onValueChange={(value) => sr.setStartDate(String(value))}
              options={sr.dateOptions}
              value={sr.startDate}
            />
          </YStack>
          <YStack flex={1} gap="$1">
            <Paragraph color="$color10" fontSize={12}>
              Bitiş
            </Paragraph>
            <AppSelect
              label="Bitiş tarihi"
              onValueChange={(value) => sr.setEndDate(String(value))}
              options={sr.dateOptions}
              value={sr.endDate}
            />
          </YStack>
        </XStack>
        <XStack
          accessibilityLabel="Uygun Günleri Getir"
          accessibilityRole="button"
          accessibilityState={{ disabled: !sr.resolvedAddress || sr.datesLoading }}
          alignItems="center"
          backgroundColor={!sr.resolvedAddress || sr.datesLoading ? '$color5' : '$brand'}
          borderRadius="$3"
          gap="$2"
          height={42}
          justifyContent="center"
          onPress={() => sr.resolvedAddress && !sr.datesLoading && sr.fetchDates()}
          pressStyle={{ opacity: 0.85 }}
        >
          {sr.datesLoading ? <Spinner color="white" size="small" /> : null}
          <Paragraph color="white" fontSize={14} fontWeight="700">
            {sr.datesLoading ? 'Sorgulanıyor...' : 'Uygun Günleri Getir'}
          </Paragraph>
        </XStack>
        {!sr.resolvedAddress ? (
          <Paragraph color="$color9" fontSize={12}>
            Uygun günleri görmek için önce bir adres seçin.
          </Paragraph>
        ) : null}
        {sr.datesError ? (
          <Paragraph color="$red10" fontSize={12}>
            {sr.datesError}
          </Paragraph>
        ) : null}
      </YStack>

      {sr.hasFetchedDates && sr.availableDates.length > 0 ? (
        <YStack gap="$2">
          <Paragraph color="$color10" fontSize={12} fontWeight="600">
            Alım Günü Seçin
          </Paragraph>
          <XStack flexWrap="wrap" gap="$2">
            {sr.availableDates.map((date) => {
              const selected = sr.selectedDate === date;
              return (
                <XStack
                  accessibilityLabel={formatPickupDate(date)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  backgroundColor={selected ? '$brand' : '$background'}
                  borderColor={selected ? '$brand' : '$borderColor'}
                  borderRadius="$3"
                  borderWidth={1}
                  key={date}
                  onPress={() => sr.setSelectedDate(date)}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Paragraph color={selected ? 'white' : '$color'} fontSize={12} fontWeight="600">
                    {formatPickupDate(date)}
                  </Paragraph>
                </XStack>
              );
            })}
          </XStack>
        </YStack>
      ) : null}
    </YStack>
  );
}
