import {
  mapOrderMergeCardSession,
  mapOrderMergeCodResult,
  mapOrderMergeEligibility,
  ORDER_MERGE_FALLBACK_TEXTS,
} from './order-merge.mapper';
import type { OrderMergeEligibilityDto } from './order-merge.dtos';

const ELIGIBLE_CARD: OrderMergeEligibilityDto = {
  eligible: true,
  ui: {
    title: 'Onaylanmış Siparişiniz Var!',
    description: '#HG100254 numaralı siparişinize ekstra kargo ödemeden ekleyebilirsiniz.',
    diff_amount_text: '250,00 TL',
    installment_text: 'Peşin Fiyatına 3 Taksit',
    button_text: 'Mevcut Siparişime Ekle',
    secondary_button_text: 'Yeni Sipariş Olarak Devam Et',
  },
  order: {
    id: 12450,
    order_no: 'HG100254',
    is_cod: false,
    is_card: true,
    is_installment: true,
    installment_count: 3,
  },
  cart_summary: { diff_amount: 250 },
};

describe('mapOrderMergeEligibility', () => {
  it('maps an installment card order with the backend texts as they are', () => {
    expect(mapOrderMergeEligibility(ELIGIBLE_CARD)).toEqual({
      orderId: 12450,
      orderNo: 'HG100254',
      paymentKind: 'card',
      title: 'Onaylanmış Siparişiniz Var!',
      description: '#HG100254 numaralı siparişinize ekstra kargo ödemeden ekleyebilirsiniz.',
      amountText: '250,00 TL',
      installmentText: 'Peşin Fiyatına 3 Taksit',
      confirmLabel: 'Mevcut Siparişime Ekle',
      continueLabel: 'Yeni Sipariş Olarak Devam Et',
    });
  });

  it('maps a cash-on-delivery order without an installment badge', () => {
    const offer = mapOrderMergeEligibility({
      ...ELIGIBLE_CARD,
      ui: { ...ELIGIBLE_CARD.ui, installment_text: 'yanlışlıkla dolu' },
      order: { ...ELIGIBLE_CARD.order, id: '77', is_cod: true, is_card: false },
    });

    expect(offer?.paymentKind).toBe('cod');
    expect(offer?.orderId).toBe(77);
    expect(offer?.installmentText).toBeNull();
  });

  it('treats a missing installment text as single payment', () => {
    const offer = mapOrderMergeEligibility({
      ...ELIGIBLE_CARD,
      ui: { ...ELIGIBLE_CARD.ui, installment_text: null },
    });

    expect(offer?.installmentText).toBeNull();
  });

  it('falls back to default labels only when the backend leaves them empty', () => {
    const offer = mapOrderMergeEligibility({ ...ELIGIBLE_CARD, ui: null });

    expect(offer).toMatchObject({
      title: ORDER_MERGE_FALLBACK_TEXTS.title,
      confirmLabel: ORDER_MERGE_FALLBACK_TEXTS.confirmLabel,
      continueLabel: ORDER_MERGE_FALLBACK_TEXTS.continueLabel,
      description: '',
      amountText: '',
    });
  });

  it.each([
    ['not eligible', { eligible: false, reason: 'no_eligible_order' }],
    ['empty answer', null],
    ['an answer without the order', { ...ELIGIBLE_CARD, order: null }],
    ['an order without an id', { ...ELIGIBLE_CARD, order: { ...ELIGIBLE_CARD.order, id: null } }],
    [
      'an order without a payment type',
      { ...ELIGIBLE_CARD, order: { ...ELIGIBLE_CARD.order, is_cod: false, is_card: false } },
    ],
    // Yayına çıkmamış backend'de istek `/order/{id}` detayına düşer; bu bir teklif değildir.
    ['an unrelated order detail body', { id: 5, order_no: 'HG1' } as OrderMergeEligibilityDto],
  ])('returns null for %s', (_, dto) => {
    expect(mapOrderMergeEligibility(dto as OrderMergeEligibilityDto | null)).toBeNull();
  });
});

describe('mapOrderMergeCodResult', () => {
  it('prefers the backend message and order number', () => {
    expect(
      mapOrderMergeCodResult(
        { success: true, message: 'Ürünler mevcut siparişinize başarıyla eklendi.', order_no: 'HG1' },
        'HG0',
      ),
    ).toEqual({ orderNo: 'HG1', message: 'Ürünler mevcut siparişinize başarıyla eklendi.' });
  });

  it('falls back to the offer order and a default message', () => {
    expect(mapOrderMergeCodResult({ success: true }, 'HG0')).toEqual({
      orderNo: 'HG0',
      message: ORDER_MERGE_FALLBACK_TEXTS.codSuccess,
    });
  });

  it('throws the backend message when the merge was refused', () => {
    expect(() =>
      mapOrderMergeCodResult({ success: false, message: 'Stok yetersiz.' }, 'HG0'),
    ).toThrow('Stok yetersiz.');
  });
});

describe('mapOrderMergeCardSession', () => {
  const PREPARED = {
    success: true,
    order_token: 'tok-1',
    order_no: 'HG100254',
    parent_order_no: 'HG100254',
    diff_amount: 250,
    total_price: 250,
    cargo_id: 4,
    payment_method_id: 1,
    installment_count: 3,
    is_installment: true,
  };

  it('maps the prepared draft for the card step', () => {
    expect(mapOrderMergeCardSession(PREPARED, 'HG0')).toEqual({
      orderToken: 'tok-1',
      parentOrderNo: 'HG100254',
      amount: 250,
      installmentCount: 3,
      cargoId: 4,
      paymentMethodId: 1,
    });
  });

  it('accepts the documented diff_total and string numbers', () => {
    const session = mapOrderMergeCardSession(
      {
        ...PREPARED,
        diff_total: '199.90',
        total_price: undefined,
        diff_amount: undefined,
        installment_count: '1',
      },
      'HG0',
    );

    expect(session.amount).toBe(199.9);
    expect(session.installmentCount).toBe(1);
  });

  it.each([
    ['no token', { ...PREPARED, order_token: '' }],
    ['no amount', { ...PREPARED, total_price: 0, diff_amount: 0 }],
    ['no cargo', { ...PREPARED, cargo_id: null }],
    ['no payment method', { ...PREPARED, payment_method_id: null }],
  ])('refuses a draft with %s', (_, dto) => {
    expect(() => mapOrderMergeCardSession(dto, 'HG0')).toThrow(
      ORDER_MERGE_FALLBACK_TEXTS.cardPrepareFailed,
    );
  });

  it('surfaces the backend message when the preparation failed', () => {
    expect(() =>
      mapOrderMergeCardSession({ success: false, message: 'Depoda toplanıyor.' }, 'HG0'),
    ).toThrow('Depoda toplanıyor.');
  });
});
