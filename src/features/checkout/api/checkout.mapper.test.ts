import {
  isGarantiRouterResponse,
  isIyzicoRouterResponse,
  mapCargoCompany,
  mapCheckoutAddress,
  mapGarantiForm,
  mapInstallmentPlans,
  mapIyzico3dsHandoff,
  mapMergeRefundMessage,
  mapPaymentMethod,
} from './checkout.mapper';

describe('mapPaymentMethod', () => {
  it('maps fields and treats an empty/zero cap as no cap', () => {
    const method = mapPaymentMethod({
      id: 1,
      name: 'Kredi Kartı',
      slug: 'credit_card',
      commission_rate: 2,
      service_fee: 5,
      sort_order: 1,
      max_order_total: '',
    });
    expect(method.commissionRate).toBe(2);
    expect(method.serviceFee).toBe(5);
    expect(method.description).toBeNull();
    expect(method.maxOrderTotal).toBeNull();
  });

  it('maps and trims the payment description', () => {
    const method = mapPaymentMethod({
      id: 1,
      name: 'Kredi Kartı',
      slug: 'credit_card',
      commission_rate: 0,
      service_fee: 0,
      sort_order: 1,
      description: '  Peşin fiyatına 3 taksit  ',
      max_order_total: null,
    });

    expect(method.description).toBe('Peşin fiyatına 3 taksit');
  });

  it('keeps a positive cap', () => {
    const method = mapPaymentMethod({
      id: 2,
      name: 'Kapıda Ödeme',
      slug: 'kapida_odeme',
      commission_rate: 0,
      service_fee: 9.9,
      sort_order: 2,
      max_order_total: '2500',
    });
    expect(method.maxOrderTotal).toBe(2500);
  });
});

describe('mapCargoCompany', () => {
  const baseDto = { id: 3, name: 'Aras', logo: 'x.png', price: '49,90', sort_order: 1 };

  it('parses the Turkish-formatted price string', () => {
    const cargo = mapCargoCompany(baseDto);
    expect(cargo.price).toBeCloseTo(49.9);
  });

  // `null` (no answer yet) must not collapse into `false` (explicitly not served).
  it('keeps missing coverage flags null', () => {
    const cargo = mapCargoCompany({ ...baseDto, to_city_district: null });
    expect(cargo.toCityDistrict).toBeNull();
    expect(cargo.toVillageRural).toBeNull();
  });

  it('maps explicit coverage flags', () => {
    const cargo = mapCargoCompany({ ...baseDto, to_city_district: true, to_village_rural: false });
    expect(cargo.toCityDistrict).toBe(true);
    expect(cargo.toVillageRural).toBe(false);
  });

  // Laravel sends 1/0 when the column is not cast to a boolean.
  it('normalises numeric coverage flags', () => {
    const cargo = mapCargoCompany({
      ...baseDto,
      to_city_district: 1 as unknown as boolean,
      to_village_rural: 0 as unknown as boolean,
    });
    expect(cargo.toCityDistrict).toBe(true);
    expect(cargo.toVillageRural).toBe(false);
  });
});

describe('mapInstallmentPlans', () => {
  it('keeps only payable plans (≥2) and sorts ascending', () => {
    const plans = mapInstallmentPlans(
      {
        status: 'success',
        installmentDetails: [
          {
            installmentPrices: [
              { installmentNumber: 1, installmentPrice: 100, totalPrice: 100 },
              { installmentNumber: 3, installmentPrice: 36, totalPrice: 108 },
              { installmentNumber: 2, installmentPrice: 52, totalPrice: 104 },
            ],
          },
        ],
      },
      100,
    );
    expect(plans.map((p) => p.installment)).toEqual([2, 3]);
    expect(plans[1].perMonth).toBe(36);
  });

  it('flags plans whose total does not exceed the single-payment amount as interest-free', () => {
    // Backend 2-3 taksit kampanyası: taksit tutarı aşağı yuvarlanır, toplam peşin tutarın kuruş altında kalabilir.
    const plans = mapInstallmentPlans(
      {
        status: 'success',
        installmentDetails: [
          {
            installmentPrices: [
              { installmentNumber: 2, installmentPrice: 500, totalPrice: 1000 },
              { installmentNumber: 3, installmentPrice: 333.33, totalPrice: 999.99 },
              { installmentNumber: 4, installmentPrice: 275.85, totalPrice: 1103.4 },
            ],
          },
        ],
      },
      1000,
    );

    expect(plans.map((plan) => [plan.installment, plan.isInterestFree])).toEqual([
      [2, true],
      [3, true],
      [4, false],
    ]);
  });

  it('does not flag a plan as interest-free when it costs more than the single payment', () => {
    const [plan] = mapInstallmentPlans(
      {
        status: 'success',
        installmentDetails: [{ installmentPrices: [{ installmentNumber: 3, installmentPrice: 34, totalPrice: 102 }] }],
      },
      100,
    );

    expect(plan.isInterestFree).toBe(false);
  });
});

describe('mapCheckoutAddress', () => {
  it('extracts location IDs, email and default/invoice flags from the raw record', () => {
    const address = mapCheckoutAddress({
      id: 7,
      title: 'Ev',
      name: 'Ada',
      surname: 'Lovelace',
      phone: '5551112233',
      address_line: 'Cad. 1',
      city_id: 34,
      district_id: 100,
      neighbourhood_id: 900,
      email: 'ada@example.com',
      is_default: 1,
      is_invoice: 0,
      city: { name: 'İstanbul' },
      district: { name: 'Kadıköy' },
      neighbourhood: { name: 'Moda' },
    });
    expect(address.cityId).toBe(34);
    expect(address.districtId).toBe(100);
    expect(address.neighbourhoodId).toBe(900);
    expect(address.email).toBe('ada@example.com');
    expect(address.cityName).toBe('İstanbul');
    expect(address.isDefault).toBe(true);
    expect(address.isInvoice).toBe(false);
  });
});

describe('isGarantiRouterResponse', () => {
  it('detects a Garanti response (gateway_url + 3D fields)', () => {
    expect(
      isGarantiRouterResponse({
        data: {
          gateway_url: 'https://sanalposprov.garanti.com.tr/servlet/gt3dengine',
          fields: { secure3dhash: 'HASH', orderid: 'ORD1' },
        },
      }),
    ).toBe(true);
  });

  it('rejects a PayTR response', () => {
    expect(
      isGarantiRouterResponse({ data: { action: 'https://www.paytr.com/odeme', paytr_token: 'T' } }),
    ).toBe(false);
  });

  it('rejects an İş Bankası response (OrderNumber present)', () => {
    expect(
      isGarantiRouterResponse({ data: { gateway_url: 'https://x', OrderNumber: '123' } }),
    ).toBe(false);
  });
});

describe('isIyzicoRouterResponse', () => {
  it('detects İyzico 3DS fields at the top level or under data', () => {
    expect(isIyzicoRouterResponse({ status: 'success', threeDSHtmlContent: '<html>3ds</html>' })).toBe(true);
    expect(isIyzicoRouterResponse({ data: { checkoutFormContent: '<form></form>' } })).toBe(true);
  });

  it('detects an İyzico response by its keys even when the HTML is empty', () => {
    expect(isIyzicoRouterResponse({ status: 'success', threeDSHtmlContent: '' })).toBe(true);
  });

  it('does not claim a Garanti response', () => {
    expect(
      isIyzicoRouterResponse({
        data: {
          gateway_url: 'https://sanalposprov.garanti.com.tr/servlet/gt3dengine',
          fields: { secure3dhash: 'HASH' },
        },
      }),
    ).toBe(false);
  });
});

describe('mapIyzico3dsHandoff', () => {
  it('prefers the 3DS HTML over a page URL', () => {
    expect(
      mapIyzico3dsHandoff({ threeDSHtmlContent: '<html>3ds</html>', paymentPageUrl: 'https://pay.example' }),
    ).toEqual({ kind: 'iyzico-html', html: '<html>3ds</html>' });
  });

  it('reads fields nested under data', () => {
    expect(mapIyzico3dsHandoff({ data: { checkoutFormContent: '<form></form>' } })).toEqual({
      kind: 'iyzico-html',
      html: '<form></form>',
    });
  });

  it('falls back to the payment page URL when the HTML is empty', () => {
    expect(
      mapIyzico3dsHandoff({ threeDSHtmlContent: '', data: { paymentPageUrl: 'https://pay.example' } }),
    ).toEqual({ kind: 'url', url: 'https://pay.example' });
  });

  it('returns null when neither HTML nor a URL is present', () => {
    expect(mapIyzico3dsHandoff({ status: 'success', threeDSHtmlContent: '' })).toBeNull();
  });
});

describe('mapGarantiForm', () => {
  it('maps the router fields into the 3D form shape', () => {
    const form = mapGarantiForm(
      {
        data: {
          gateway_url: 'https://gw',
          order_no: 'ORD9',
          amount: '169.98',
          fields: {
            secure3dhash: 'HASH',
            terminalid: 'T1',
            terminalmerchantid: 'M1',
            terminalprovuserid: 'PROVAUT',
            txntype: 'sales',
            txncurrencycode: '949',
            successurl: 'https://haydigiy.com/garanti/callback-success',
            errorurl: 'https://haydigiy.com/garanti/callback-fail',
          },
        },
      },
      1,
    );
    expect(form.gatewayUrl).toBe('https://gw');
    expect(form.orderId).toBe('ORD9');
    expect(form.amount).toBe('169.98');
    expect(form.hashedData).toBe('HASH');
    expect(form.terminalId).toBe('T1');
    expect(form.successUrl).toContain('callback-success');
    expect(form.installmentCount).toBe(1);
  });
});

describe('mapMergeRefundMessage', () => {
  const refundMessage =
    'Siparişiniz hazırlanmaya başladığı için eklenen ürünler birleştirilemedi. Ödemeniz kartınıza iade edildi.';

  it('returns the backend message for a refunded order-merge difference', () => {
    expect(mapMergeRefundMessage({ success: true, status_id: 4, message: refundMessage })).toBe(refundMessage);
    expect(mapMergeRefundMessage({ success: true, status_id: '4', message: '  ' })).toBe(
      'Ürünler siparişinize eklenemedi.',
    );
  });

  it('ignores confirmed payments and empty answers', () => {
    expect(mapMergeRefundMessage({ success: true, status_id: 3, message: 'Ödeme başarıyla işlendi.' })).toBeNull();
    expect(mapMergeRefundMessage({ success: true, status_id: 16 })).toBeNull();
    expect(mapMergeRefundMessage(null)).toBeNull();
    expect(mapMergeRefundMessage(undefined)).toBeNull();
  });
});
