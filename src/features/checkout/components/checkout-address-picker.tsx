import { Pressable, useWindowDimensions } from 'react-native';
import { Pencil, X } from '@/components/ui/icons';
import { ScrollView, Separator, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { CheckoutAddress } from '@/types/checkout.types';
import { formatCheckoutAddressLine } from '../utils/format-checkout-address';

interface CheckoutAddressPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  addresses: CheckoutAddress[];
  selectedId: number | null;
  badgeMode: 'default' | 'invoice';
  onSelect: (address: CheckoutAddress) => void;
  onEditAddress: (address: CheckoutAddress) => void;
  onAddAddress: () => void;
}

function getAddressBadge(address: CheckoutAddress, badgeMode: 'default' | 'invoice') {
  if (badgeMode === 'invoice') {
    return address.isInvoice ? 'Fatura Adresi' : null;
  }

  return address.isDefault ? 'Varsayılan' : null;
}

export interface CheckoutAddressOptionProps {
  address: CheckoutAddress;
  badgeMode: 'default' | 'invoice';
  selected: boolean;
  onSelect: (address: CheckoutAddress) => void;
  onEditAddress: (address: CheckoutAddress) => void;
}

export function CheckoutAddressOption({
  address,
  badgeMode,
  selected,
  onSelect,
  onEditAddress,
}: CheckoutAddressOptionProps) {
  const badge = getAddressBadge(address, badgeMode);
  const line = formatCheckoutAddressLine(address);

  return (
    <YStack
      accessibilityLabel={`${address.title} adresini seç`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      gap="$1.5"
      onPress={() => onSelect(address)}
      paddingHorizontal="$2"
      paddingVertical="$3"
      pressStyle={{ backgroundColor: '$backgroundHover' }}
    >
      <XStack alignItems="center" gap="$2" justifyContent="space-between">
        <XStack alignItems="center" flex={1} gap="$2">
          <Paragraph color="$color" flexShrink={1} fontSize={16} fontWeight="600">
            {address.title}
          </Paragraph>
          {badge ? (
            <XStack backgroundColor="$backgroundHover" borderRadius="$2" paddingHorizontal="$2" paddingVertical={2}>
              <Paragraph color="$color10" fontSize={12}>
                {badge}
              </Paragraph>
            </XStack>
          ) : null}
        </XStack>
        <Pressable
          accessibilityLabel={`${address.title} adresini düzenle`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={(event) => {
            event?.stopPropagation?.();
            onEditAddress(address);
          }}
        >
          <XStack alignItems="center" gap="$1">
            <Pencil color="$brand" size={13} />
            <Paragraph color="$brand" fontSize={12} fontWeight="500">
              Düzenle
            </Paragraph>
          </XStack>
        </Pressable>
      </XStack>
      {line ? (
        <Paragraph color="$color10" fontSize={14} lineHeight={22}>
          {line}
        </Paragraph>
      ) : null}
    </YStack>
  );
}

interface CheckoutAddressListContentProps {
  addresses: CheckoutAddress[];
  selectedId: number | null;
  badgeMode: 'default' | 'invoice';
  onSelect: (address: CheckoutAddress) => void;
  onEditAddress: (address: CheckoutAddress) => void;
}

export function CheckoutAddressListContent({
  addresses,
  selectedId,
  badgeMode,
  onSelect,
  onEditAddress,
}: CheckoutAddressListContentProps) {
  return (
    <>
      {addresses.map((address, index) => (
        <YStack key={address.id}>
          {index > 0 ? <Separator borderColor="$borderColor" marginVertical="$2" /> : null}
          <CheckoutAddressOption
            address={address}
            badgeMode={badgeMode}
            onEditAddress={onEditAddress}
            onSelect={onSelect}
            selected={address.id === selectedId}
          />
        </YStack>
      ))}
    </>
  );
}

/** Bottom-sheet list for choosing a shipping/billing address (theme-aware). */
export function CheckoutAddressPicker({
  open,
  onOpenChange,
  title,
  addresses,
  selectedId,
  badgeMode,
  onSelect,
  onEditAddress,
  onAddAddress,
}: CheckoutAddressPickerProps) {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.min(Math.round(height * 0.78), 240 + addresses.length * 92);

  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={onOpenChange}
      open={open}
      snapPoints={[sheetHeight]}
      snapPointsMode="constant"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$5" borderTopRightRadius="$5">
        <YStack alignItems="center" paddingTop="$2">
          <YStack backgroundColor="$borderColor" borderRadius="$10" height={4} width={48} />
        </YStack>
        <YStack
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          paddingHorizontal="$4"
          paddingBottom="$4"
          paddingTop="$3"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <Paragraph color="$color" fontSize={20} fontWeight="500">
              {title}
            </Paragraph>
            <XStack
              accessibilityLabel="Adres seçimini kapat"
              accessibilityRole="button"
              alignItems="center"
              backgroundColor="$backgroundHover"
              borderRadius="$10"
              height={44}
              justifyContent="center"
              onPress={() => onOpenChange(false)}
              pressStyle={{ opacity: 0.7 }}
              width={44}
            >
              <X color="$color10" size={24} />
            </XStack>
          </XStack>
        </YStack>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}
        >
          <CheckoutAddressListContent
            addresses={addresses}
            badgeMode={badgeMode}
            onEditAddress={onEditAddress}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        </ScrollView>
        <Separator borderColor="$borderColor" />
        <YStack paddingHorizontal="$4" paddingVertical="$4">
          <XStack
            accessibilityLabel="Yeni adres ekle"
            accessibilityRole="button"
            alignItems="center"
            backgroundColor="$brand"
            borderRadius="$3"
            height={52}
            justifyContent="center"
            onPress={onAddAddress}
            pressStyle={{ opacity: 0.85 }}
          >
            <Paragraph color="white" fontSize={16} fontWeight="600">
              Yeni Adres Ekle
            </Paragraph>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
