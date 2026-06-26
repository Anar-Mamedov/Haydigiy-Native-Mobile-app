import {
  isGarantiRouterResponse,
  mapCargoCompany,
  mapCheckoutAddress,
  mapGarantiForm,
  mapInstallmentPlans,
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
    expect(method.maxOrderTotal).toBeNull();
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
  it('parses the Turkish-formatted price string', () => {
    const cargo = mapCargoCompany({ id: 3, name: 'Aras', logo: 'x.png', price: '49,90', sort_order: 1 });
    expect(cargo.price).toBeCloseTo(49.9);
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
