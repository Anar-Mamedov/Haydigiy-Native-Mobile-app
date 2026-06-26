import { useState } from 'react';
import { Pressable } from 'react-native';
import { MapPin, Plus, RefreshCw } from '@tamagui/lucide-icons-2';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';
import { CheckoutSection } from './checkout-section';
import { CheckoutAddressPicker } from './checkout-address-picker';
import { AppButton, AppCheckbox } from '@/components/ui';
import { CheckoutAddress } from '@/types/checkout.types';
import {
  formatCheckoutAddressLine,
  formatCheckoutRecipient,
} from '../utils/format-checkout-address';

interface CheckoutDeliveryAddressProps {
  addresses: CheckoutAddress[];
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  sendInvoiceToSameAddress: boolean;
  isLoading: boolean;
  isError: boolean;
  onSelectShipping: (address: CheckoutAddress) => void;
  onSelectBilling: (address: CheckoutAddress) => void;
  onToggleInvoiceSame: (next: boolean) => void;
  onAddAddress: () => void;
  onEditAddress: (address: CheckoutAddress) => void;
  onRetry: () => void;
}

function AddressSummary({ address }: { address: CheckoutAddress }) {
  const recipient = formatCheckoutRecipient(address);
  const line = formatCheckoutAddressLine(address);

  return (
    <YStack gap="$1">
      <Paragraph color="$color" fontSize={14} fontWeight="700">
        {address.title}
      </Paragraph>
      {recipient ? (
        <Paragraph color="$color11" fontSize={13}>
          {recipient}
        </Paragraph>
      ) : null}
      {line ? (
        <Paragraph color="$color10" fontSize={12} lineHeight={18}>
          {line}
        </Paragraph>
      ) : null}
    </YStack>
  );
}

function ChangeButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityLabel="Adresi değiştir" accessibilityRole="button" onPress={onPress}>
      <Paragraph color="$brand" fontSize={13} fontWeight="600">
        Değiştir
      </Paragraph>
    </Pressable>
  );
}

export function CheckoutDeliveryAddress({
  addresses,
  shippingAddress,
  billingAddress,
  sendInvoiceToSameAddress,
  isLoading,
  isError,
  onSelectShipping,
  onSelectBilling,
  onToggleInvoiceSame,
  onAddAddress,
  onEditAddress,
  onRetry,
}: CheckoutDeliveryAddressProps) {
  const [shippingPickerOpen, setShippingPickerOpen] = useState(false);
  const [billingPickerOpen, setBillingPickerOpen] = useState(false);

  return (
    <CheckoutSection title="Teslimat Adresi">
      {isLoading ? (
        <YStack alignItems="center" paddingVertical="$4">
          <Spinner color="$brand" />
        </YStack>
      ) : isError ? (
        <YStack alignItems="center" gap="$3" paddingVertical="$3">
          <Paragraph color="$red10" fontSize={13} fontWeight="600" textAlign="center">
            Adresler yüklenirken bir hata oluştu.
          </Paragraph>
          <AppButton
            accessibilityLabel="Adresleri tekrar yükle"
            backgroundColor="$background"
            color="$brand"
            icon={RefreshCw}
            onPress={onRetry}
          >
            Tekrar Dene
          </AppButton>
        </YStack>
      ) : addresses.length === 0 ? (
        <YStack alignItems="center" gap="$3" paddingVertical="$3">
          <MapPin color="$color9" size={28} />
          <Paragraph color="$color10" fontSize={13} textAlign="center">
            Henüz kayıtlı adresiniz yok. Devam etmek için bir teslimat adresi ekleyin.
          </Paragraph>
          <XStack
            accessibilityLabel="Yeni adres ekle"
            accessibilityRole="button"
            alignItems="center"
            gap="$2"
            onPress={onAddAddress}
            pressStyle={{ opacity: 0.6 }}
          >
            <Plus color="$brand" size={18} />
            <Paragraph color="$brand" fontSize={14} fontWeight="600">
              Yeni Adres Ekle
            </Paragraph>
          </XStack>
        </YStack>
      ) : (
        <YStack gap="$3">
          <XStack gap="$3" justifyContent="space-between">
            {shippingAddress ? (
              <YStack flex={1}>
                <AddressSummary address={shippingAddress} />
              </YStack>
            ) : (
              <Paragraph color="$color10" flex={1} fontSize={13}>
                Lütfen bir teslimat adresi seçin.
              </Paragraph>
            )}
            <ChangeButton onPress={() => setShippingPickerOpen(true)} />
          </XStack>

          <AppCheckbox
            accessibilityLabel="Faturamı aynı adrese gönder"
            checked={sendInvoiceToSameAddress}
            onChange={onToggleInvoiceSame}
            size={20}
          >
            <Paragraph color="$color11" fontSize={13}>
              Faturamı aynı adrese gönder
            </Paragraph>
          </AppCheckbox>

          {!sendInvoiceToSameAddress ? (
            <YStack
              borderColor="$borderColor"
              borderRadius="$4"
              borderWidth={1}
              gap="$2"
              padding="$3"
            >
              <Paragraph color="$color10" fontSize={12} fontWeight="600">
                Fatura Adresi
              </Paragraph>
              <XStack gap="$3" justifyContent="space-between">
                {billingAddress ? (
                  <YStack flex={1}>
                    <AddressSummary address={billingAddress} />
                  </YStack>
                ) : (
                  <Paragraph color="$color10" flex={1} fontSize={13}>
                    Lütfen bir fatura adresi seçin.
                  </Paragraph>
                )}
                <ChangeButton onPress={() => setBillingPickerOpen(true)} />
              </XStack>
            </YStack>
          ) : null}
        </YStack>
      )}

      <CheckoutAddressPicker
        addresses={addresses}
        onAddAddress={() => {
          setShippingPickerOpen(false);
          onAddAddress();
        }}
        onEditAddress={(address) => {
          setShippingPickerOpen(false);
          onEditAddress(address);
        }}
        onOpenChange={setShippingPickerOpen}
        onSelect={(address) => {
          onSelectShipping(address);
          setShippingPickerOpen(false);
        }}
        open={shippingPickerOpen}
        selectedId={shippingAddress?.id ?? null}
        badgeMode="default"
        title="Teslimat Adresi Seçin"
      />

      <CheckoutAddressPicker
        addresses={addresses}
        onAddAddress={() => {
          setBillingPickerOpen(false);
          onAddAddress();
        }}
        onEditAddress={(address) => {
          setBillingPickerOpen(false);
          onEditAddress(address);
        }}
        onOpenChange={setBillingPickerOpen}
        onSelect={(address) => {
          onSelectBilling(address);
          setBillingPickerOpen(false);
        }}
        open={billingPickerOpen}
        selectedId={billingAddress?.id ?? null}
        badgeMode="invoice"
        title="Fatura Adresi Seçin"
      />
    </CheckoutSection>
  );
}
