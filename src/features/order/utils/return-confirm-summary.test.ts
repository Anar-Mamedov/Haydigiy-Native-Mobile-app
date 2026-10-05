import {
  buildReturnConfirmDetails,
  buildReturnConfirmItems,
  pickConfirmIban,
} from './return-confirm-summary';
import { buildOrderItemGroups, flattenGroupRows } from './order-item-groups';
import { OrderDetailItem, PaymentMethod } from '@/types/order.types';

function makeItem(overrides: Partial<OrderDetailItem> & { id: number }): OrderDetailItem {
  return {
    name: 'Ürün',
    variantName: 'M',
    slug: 'urun',
    image: 'https://cdn/urun.webp',
    quantity: 1,
    price: 349.99,
    kind: 'normal',
    returnStatus: 'available',
    ...overrides,
  };
}

const REASONS = [
  { id: 1, name: 'Beden büyük geldi' },
  { id: 2, name: 'Ürün hasarlı geldi' },
];

const rows = flattenGroupRows(
  buildOrderItemGroups([
    makeItem({ id: 10, name: 'Pijama Takımı', variantName: 'S-M', quantity: 2 }),
    makeItem({ id: 20, name: 'Hediye Çorap', variantName: '', image: null, returnStatus: 'gift_product' }),
    makeItem({ id: 30, name: 'Kruvaze Ceket', variantName: '38' }),
  ]),
);

describe('buildReturnConfirmItems', () => {
  // Kullanıcı onaylamadan önce hangi ürünü hangi nedenle iade ettiğini görür;
  // aynı ürünün aynı nedenle iade edilen adetleri tek satırda toplanır.
  it('merges units of the same product and reason, keeping the screen order', () => {
    const items = buildReturnConfirmItems({
      rows,
      selectedIds: ['20-0', '10-1', '10-0'],
      itemReasons: { '10-0': 1, '10-1': 1, '20-0': 1, '30-0': 2 },
      reasons: REASONS,
    });

    expect(items).toEqual([
      {
        key: '10:1',
        name: 'Pijama Takımı',
        variantName: 'S-M',
        imageUrl: 'https://cdn/urun.webp',
        quantity: 2,
        reasonName: 'Beden büyük geldi',
        isGift: false,
      },
      {
        key: '20:1',
        name: 'Hediye Çorap',
        variantName: '',
        imageUrl: null,
        quantity: 1,
        reasonName: 'Beden büyük geldi',
        isGift: true,
      },
    ]);
  });

  it('keeps units with different reasons on separate lines', () => {
    const items = buildReturnConfirmItems({
      rows,
      selectedIds: ['10-0', '10-1'],
      itemReasons: { '10-0': 1, '10-1': 2 },
      reasons: REASONS,
    });

    expect(items.map((item) => [item.key, item.quantity, item.reasonName])).toEqual([
      ['10:1', 1, 'Beden büyük geldi'],
      ['10:2', 1, 'Ürün hasarlı geldi'],
    ]);
  });

  it('leaves out a selected unit that has no reason yet', () => {
    expect(
      buildReturnConfirmItems({ rows, selectedIds: ['30-0'], itemReasons: {}, reasons: REASONS }),
    ).toEqual([]);
  });
});

describe('buildReturnConfirmDetails', () => {
  const base = {
    isStorePickup: false,
    pickupDateLabel: null,
    refundMethodName: null,
    iban: null,
    note: '   ',
  };

  it('shows only the method line for a plain PTT return', () => {
    expect(buildReturnConfirmDetails({ ...base, returnMethod: 'ptt' })).toEqual([
      { label: 'İade Yöntemi', value: 'PTT Kargo Şubesinden Gönder' },
    ]);
  });

  it('lists the pickup date, refund method, IBAN and note for a Hepsijet return', () => {
    expect(
      buildReturnConfirmDetails({
        isStorePickup: false,
        returnMethod: 'hepsijet',
        pickupDateLabel: '7 Eki Çarşamba',
        refundMethodName: "IBAN'a İade",
        iban: { iban: 'TR120006200000000000000001', ibanName: 'Ayşe Yılmaz' },
        note: '  Kargo poşetiyle göndereceğim.  ',
      }),
    ).toEqual([
      { label: 'İade Yöntemi', value: 'Adresimden Randevulu Aldır' },
      { label: 'Kurye Randevusu', value: '7 Eki Çarşamba' },
      { label: 'Geri Ödeme', value: "IBAN'a İade" },
      { label: "İade IBAN'ı", value: 'TR12 0006 2000 0000 0000 0000 01' },
      { label: 'IBAN Sahibi', value: 'Ayşe Yılmaz' },
      { label: 'Not', value: 'Kargo poşetiyle göndereceğim.' },
    ]);
  });

  it('describes a store-pickup order as a store return without a pickup date', () => {
    expect(
      buildReturnConfirmDetails({
        ...base,
        isStorePickup: true,
        returnMethod: 'hepsijet',
        pickupDateLabel: '7 Eki Çarşamba',
      }),
    ).toEqual([{ label: 'İade Yöntemi', value: 'Mağazaya İade' }]);
  });
});

describe('pickConfirmIban', () => {
  const saved: PaymentMethod[] = [
    { id: 7, iban: 'TR120006200000000000000001', ibanName: 'Ayşe Yılmaz', isDefault: true },
    { id: 8, iban: 'TR340006200000000000000002', ibanName: 'Ali Yılmaz', isDefault: false },
  ];

  it('uses the selected saved IBAN, like the submit does', () => {
    expect(pickConfirmIban({ savedIbans: saved, selectedIbanId: 8, newIban: '', newIbanName: '' })).toEqual({
      iban: 'TR340006200000000000000002',
      ibanName: 'Ali Yılmaz',
    });
    expect(pickConfirmIban({ savedIbans: saved, selectedIbanId: null, newIban: '12', newIbanName: 'X' })).toBeNull();
  });

  it('falls back to the typed IBAN when the user has no saved one', () => {
    expect(
      pickConfirmIban({
        savedIbans: [],
        selectedIbanId: null,
        newIban: '120006200000000000000001',
        newIbanName: ' Ayşe Yılmaz ',
      }),
    ).toEqual({ iban: 'TR120006200000000000000001', ibanName: 'Ayşe Yılmaz' });
    expect(pickConfirmIban({ savedIbans: [], selectedIbanId: null, newIban: '', newIbanName: 'Ayşe' })).toBeNull();
  });
});
