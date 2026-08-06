import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { OrderAddress, OrderDetail } from '@/types/order.types';
import { SELLER_INFO } from '../data/agreement-content';

function price(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} TL`;
}

function formatAddress(address: OrderAddress | null): string {
  if (!address) return '-';
  const parts = [
    address.addressLine,
    address.neighbourhood,
    address.district,
    address.city,
    address.zipCode ?? '',
  ].filter(Boolean);
  return parts.join(', ').trim() || '-';
}

function fullName(address: OrderAddress | null): string {
  if (!address) return '-';
  return `${address.name} ${address.surname}`.trim() || '-';
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <Paragraph color="$color10" fontSize={13} lineHeight={19}>
      <Paragraph color="$color" fontSize={13} fontWeight="700">
        {label}:{' '}
      </Paragraph>
      {value}
    </Paragraph>
  );
}

function TableRow({
  name,
  qty,
  unit,
  total,
  header,
  bold,
}: {
  name: string;
  qty: string;
  unit: string;
  total: string;
  header?: boolean;
  bold?: boolean;
}) {
  const color = header || bold ? '$color' : '$color10';
  const weight = header || bold ? '700' : '400';
  return (
    <XStack borderBottomColor="$borderColor" borderBottomWidth={1}>
      <Paragraph color={color} flex={3} fontSize={11} fontWeight={weight} padding="$1.5">
        {name}
      </Paragraph>
      <Paragraph color={color} flex={1} fontSize={11} fontWeight={weight} padding="$1.5" textAlign="center">
        {qty}
      </Paragraph>
      <Paragraph color={color} flex={2} fontSize={11} fontWeight={weight} padding="$1.5" textAlign="right">
        {unit}
      </Paragraph>
      <Paragraph color={color} flex={2} fontSize={11} fontWeight={weight} padding="$1.5" textAlign="right">
        {total}
      </Paragraph>
    </XStack>
  );
}

type AgreementOrderDetailsProps = {
  order: OrderDetail;
};

/** Dynamic "Mesafeli" blocks: buyer/seller/billing info + product table + delivery. */
export function AgreementOrderDetails({ order }: AgreementOrderDetailsProps) {
  const { totals } = order;
  const taxInfo =
    order.taxOffice && order.taxNumber
      ? `${order.taxOffice} / ${order.taxNumber}`
      : order.taxNumber || '-';

  return (
    <YStack gap="$4">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={15} fontWeight="800">
          ALICI, SATICI VE FATURA BİLGİLERİ
        </Paragraph>

        <YStack gap="$1.5">
          <Paragraph color="$color" fontSize={13} fontWeight="700">
            ALICI BİLGİLERİ
          </Paragraph>
          <KeyValue label="Teslim Edilecek Kişi" value={fullName(order.shippingAddress)} />
          <KeyValue label="Teslimat Adresi" value={formatAddress(order.shippingAddress)} />
          <KeyValue label="Telefon" value={order.shippingAddress?.phone || '-'} />
          <KeyValue label="E-posta/Kullanıcı Adı" value={order.shippingAddress?.email || '-'} />
        </YStack>

        <YStack gap="$1.5">
          <Paragraph color="$color" fontSize={13} fontWeight="700">
            SATICI BİLGİLERİ
          </Paragraph>
          {SELLER_INFO.map((info) => (
            <KeyValue key={info.label} label={info.label} value={info.value} />
          ))}
        </YStack>

        <YStack gap="$1.5">
          <Paragraph color="$color" fontSize={13} fontWeight="700">
            FATURA BİLGİLERİ
          </Paragraph>
          <KeyValue label="Ticari Unvanı / Adı ve Soyadı" value={fullName(order.billingAddress)} />
          <KeyValue label="Vergi Dairesi ve Vergi Kimlik Numarası" value={taxInfo} />
          <KeyValue label="Adres" value={formatAddress(order.billingAddress)} />
          <KeyValue label="Telefon" value={order.billingAddress?.phone || '-'} />
          <KeyValue label="E-posta/Kullanıcı Adı" value={order.billingAddress?.email || '-'} />
          <KeyValue
            label="Fatura Teslim"
            value="Fatura sipariş teslimatı sırasında teslimat adresine sipariş ile birlikte ve/veya e-fatura yöntemiyle elektronik posta adresine teslim edilecektir."
          />
        </YStack>
      </YStack>

      <YStack gap="$3">
        <Paragraph color="$color" fontSize={15} fontWeight="800">
          ÜRÜN/HİZMET ve TESLİMAT BİLGİLERİ
        </Paragraph>

        <YStack borderColor="$borderColor" borderRadius="$3" borderTopWidth={1} borderLeftWidth={0} overflow="hidden">
          <TableRow header name="Ürün/Hizmet Açıklaması" qty="Adet" unit="Peşin Fiyatı" total="Ara Toplam" />
          {order.items.map((item, index) => (
            <TableRow
              key={`${item.id}-${index}`}
              name={item.name}
              qty={String(item.quantity)}
              total={price(item.price * item.quantity)}
              unit={price(item.price)}
            />
          ))}
          <TableRow name="Kargo Tutarı" qty="1" total={price(totals.cargoFee)} unit={price(totals.cargoFee)} />
          {totals.codFee > 0 ? (
            <TableRow name="Kapıda Ödeme Hizmet Ücreti" qty="1" total={price(totals.codFee)} unit={price(totals.codFee)} />
          ) : null}
          {totals.paymentFee > 0 ? (
            <TableRow name="Ödeme Ücreti" qty="1" total={price(totals.paymentFee)} unit={price(totals.paymentFee)} />
          ) : null}
          <TableRow bold name="" qty="" total={price(totals.total)} unit="Toplam" />
        </YStack>

        <YStack gap="$1.5">
          <KeyValue label="Teslim Edilecek Kişi" value={fullName(order.shippingAddress)} />
          <KeyValue label="Teslimat Adresi" value={formatAddress(order.shippingAddress)} />
          <KeyValue label="Fatura Adresi" value={formatAddress(order.billingAddress)} />
          <KeyValue label="Sipariş Tarihi" value={order.createdAt || '-'} />
          <KeyValue label="Teslim Şekli" value="Kargo ile teslim" />
          <KeyValue
            label="Teslimat Süresi"
            value="En geç 30 gün (Sözleşme ve ilgili mevzuat hükümlerinde yer alan istisnalar saklıdır.)"
          />
          <KeyValue label="Teslimatın Yapılacağı Kargo Şirketi" value="Anlaşmalı kargo şirketi" />
          <KeyValue
            label="Kargo Şirketine Teslim Süresi"
            value="7 iş günü içinde (Belirtilen süre teslimatın taahhüdü değildir, satıcı tarafından kargo şirketine teslim edilme süresini ifade eder.)"
          />
        </YStack>
      </YStack>
    </YStack>
  );
}
