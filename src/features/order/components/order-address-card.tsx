import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { OrderAddress, OrderDetail } from '@/types/order.types';

function AddressBlock({
  title,
  address,
  children,
}: {
  title: string;
  address: OrderAddress | null;
  children?: React.ReactNode;
}) {
  return (
    <YStack gap="$2">
      <Paragraph
        borderBottomColor="$borderColor"
        borderBottomWidth={1}
        color="$color"
        fontSize={13}
        fontWeight="600"
        paddingBottom="$1.5"
      >
        {title}
      </Paragraph>
      {address ? (
        <YStack gap="$1">
          <Paragraph color="$color" fontSize={12} fontWeight="700">
            {address.name} {address.surname}
          </Paragraph>
          <Paragraph color="$color10" fontSize={12}>
            {address.neighbourhood}, {address.district}
          </Paragraph>
          <Paragraph color="$color10" fontSize={12}>
            {address.addressLine}
          </Paragraph>
          <Paragraph color="$color10" fontSize={12}>
            {address.city} {address.zipCode ?? ''}
          </Paragraph>
          <Paragraph color="$color10" fontSize={12}>
            {address.phone}
          </Paragraph>
          {children}
        </YStack>
      ) : (
        <Paragraph color="$color10" fontSize={12}>
          Adres bilgisi mevcut değil.
        </Paragraph>
      )}
    </YStack>
  );
}

type OrderAddressCardProps = {
  order: OrderDetail;
};

export function OrderAddressCard({ order }: OrderAddressCardProps) {
  return (
    <SectionCard padding="$3">
      <YStack gap="$4">
        <Paragraph color="$color" fontSize={15} fontWeight="700">
          Teslimat & Fatura Bilgileri
        </Paragraph>

        <AddressBlock address={order.shippingAddress} title="Teslimat Adresi" />

        <AddressBlock address={order.billingAddress} title="Fatura Adresi">
          {order.billingType === 'individual' && order.tcNumber ? (
            <Paragraph color="$color10" fontSize={12}>
              TCKN: {order.tcNumber}
            </Paragraph>
          ) : null}
          {order.billingType !== 'individual' ? (
            <>
              {order.taxOffice ? (
                <Paragraph color="$color10" fontSize={12}>
                  Vergi Dairesi: {order.taxOffice}
                </Paragraph>
              ) : null}
              {order.taxNumber ? (
                <Paragraph color="$color10" fontSize={12}>
                  Vergi Numarası: {order.taxNumber}
                </Paragraph>
              ) : null}
            </>
          ) : null}
        </AddressBlock>
      </YStack>
    </SectionCard>
  );
}
