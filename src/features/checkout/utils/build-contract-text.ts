import { formatCurrency } from '@/utils/format-currency';
import { CheckoutAddress } from '@/types/checkout.types';

export interface ContractData {
  buyer: CheckoutAddress | null;
  billing: CheckoutAddress | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  cargoPrice: number;
  serviceFee: number;
  total: number;
  paymentMethodName: string;
}

const SELLER =
  'Satıcı: HaydiGiy\nMersis/İletişim: HaydiGiy Müşteri Hizmetleri\nWhatsApp: +90 532 780 51 00';

function formatAddress(address: CheckoutAddress | null): string {
  if (!address) return '-';
  return [
    `${address.name} ${address.surname}`.trim(),
    address.phone,
    address.email ?? '',
    `${address.addressLine}, ${address.neighbourhoodName} ${address.districtName} / ${address.cityName}`.trim(),
  ]
    .filter(Boolean)
    .join('\n');
}

function formatItems(items: ContractData['items']): string {
  if (items.length === 0) return '-';
  return items
    .map(
      (item) =>
        `• ${item.name} (${item.quantity} adet) — ${formatCurrency(item.unitPrice * item.quantity)}`,
    )
    .join('\n');
}

function formatTotals(data: ContractData): string {
  const lines = [`Ara Toplam: ${formatCurrency(data.subtotal)}`];
  if (data.serviceFee > 0) lines.push(`Hizmet Bedeli: ${formatCurrency(data.serviceFee)}`);
  lines.push(`Kargo: ${data.cargoPrice > 0 ? formatCurrency(data.cargoPrice) : 'Ücretsiz'}`);
  lines.push(`Genel Toplam: ${formatCurrency(data.total)}`);
  lines.push(`Ödeme Yöntemi: ${data.paymentMethodName}`);
  return lines.join('\n');
}

/** Pre-information form (Ön Bilgilendirme Koşulları), generated from the order. */
export function buildPreInfoText(data: ContractData): string {
  return [
    'ÖN BİLGİLENDİRME KOŞULLARI',
    '',
    SELLER,
    '',
    'ALICI BİLGİLERİ',
    formatAddress(data.buyer),
    '',
    'FATURA ADRESİ',
    formatAddress(data.billing ?? data.buyer),
    '',
    'SÖZLEŞME KONUSU ÜRÜNLER',
    formatItems(data.items),
    '',
    'ÖDEME BİLGİLERİ',
    formatTotals(data),
    '',
    'TESLİMAT',
    'Ürünler, seçtiğiniz kargo firması ile belirtilen teslimat adresine gönderilir. Kargo ücreti ve teslimat süresi sipariş özetinde belirtilmiştir.',
    '',
    'CAYMA HAKKI',
    'Alıcı, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı, mevzuatın öngördüğü istisnalar saklı kalmak kaydıyla geçerlidir.',
  ].join('\n');
}

/** Distance sales contract (Mesafeli Satış Sözleşmesi), generated from the order. */
export function buildDistanceSalesText(data: ContractData): string {
  return [
    'MESAFELİ SATIŞ SÖZLEŞMESİ',
    '',
    'MADDE 1 - TARAFLAR',
    SELLER,
    '',
    'ALICI',
    formatAddress(data.buyer),
    '',
    'MADDE 2 - KONU',
    'İşbu sözleşmenin konusu, Alıcının elektronik ortamda sipariş verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünlerin satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerinin belirlenmesidir.',
    '',
    'MADDE 3 - SÖZLEŞME KONUSU ÜRÜN VE ÖDEME',
    formatItems(data.items),
    '',
    formatTotals(data),
    '',
    'MADDE 4 - GENEL HÜKÜMLER',
    'Alıcı, sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder. Ürünlerin teslimat masrafı aksi belirtilmedikçe Alıcıya aittir.',
    '',
    'MADDE 5 - CAYMA HAKKI',
    'Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde cayma hakkını kullanabilir. İade edilecek ürünün kutusu, ambalajı ve varsa standart aksesuarları ile birlikte eksiksiz ve hasarsız olarak teslim edilmesi gerekmektedir.',
  ].join('\n');
}
