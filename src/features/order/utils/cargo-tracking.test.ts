import {
  CARGO_TRACKING_PENDING_MESSAGE,
  getCustomerTrackingCode,
  isArasCargoCompany,
  isCargoTrackingPending,
} from './cargo-tracking';

const ARAS = 'Aras Kargo';

describe('getCustomerTrackingCode', () => {
  it('hides the Aras placeholder the backend writes before the carrier responds', () => {
    // Real record from the ticket: the tracking field holds the order's own number.
    expect(
      getCustomerTrackingCode({
        cargoCompanyName: ARAS,
        orderNo: 'HG0608261190940',
        trackingCode: 'HG0608261190940',
      }),
    ).toBeNull();
    expect(
      isCargoTrackingPending({
        cargoCompanyName: ARAS,
        orderNo: 'HG0608261190940',
        trackingCode: 'HG0608261190940',
      }),
    ).toBe(true);

    // The HG shape alone is enough, even without the order number at hand.
    expect(
      getCustomerTrackingCode({ cargoCompanyName: 'ARAS KARGO', trackingCode: 'HG0608261190940' }),
    ).toBeNull();
    expect(
      getCustomerTrackingCode({ cargoCompanyName: 'aras', trackingCode: 'hg0608261190940' }),
    ).toBeNull();
  });

  /**
   * Placeholder yalnızca Aras entegrasyonunda oluşuyor; diğer firmaların kodları
   * iç formata benzese bile filtrelenmemeli.
   */
  it('never filters other carriers, even when the code looks internal', () => {
    expect(
      getCustomerTrackingCode({
        cargoCompanyName: 'Hepsijet',
        orderNo: 'HG0608261190940',
        trackingCode: 'HG0608261190940',
      }),
    ).toBe('HG0608261190940');
    expect(
      getCustomerTrackingCode({ cargoCompanyName: 'Sürat Kargo', trackingCode: 'HG123456' }),
    ).toBe('HG123456');
  });

  /** Firma bilinmiyorsa Aras olduğu varsayılamaz; kod olduğu gibi gösterilir. */
  it('shows the code when the carrier is unknown', () => {
    expect(
      getCustomerTrackingCode({ orderNo: 'HG0608261190940', trackingCode: 'HG0608261190940' }),
    ).toBe('HG0608261190940');
    expect(getCustomerTrackingCode({ cargoCompanyName: null, trackingCode: 'HG123' })).toBe('HG123');
  });

  it('shows a real tracking number issued by Aras', () => {
    expect(
      getCustomerTrackingCode({
        cargoCompanyName: ARAS,
        orderNo: 'HG0608261190940',
        trackingCode: '6475494566146',
      }),
    ).toBe('6475494566146');
    expect(
      isCargoTrackingPending({
        cargoCompanyName: ARAS,
        orderNo: 'HG0608261190940',
        trackingCode: '6475494566146',
      }),
    ).toBe(false);
    // Boşluklar temizlenir
    expect(
      getCustomerTrackingCode({ cargoCompanyName: ARAS, trackingCode: '  6475494566146  ' }),
    ).toBe('6475494566146');
  });

  it('hides an Aras code that is a copy of the order number', () => {
    // Sipariş numarası öneki ileride değişse bile eşitlik kuralı yakalar.
    expect(
      getCustomerTrackingCode({
        cargoCompanyName: ARAS,
        orderNo: 'SP2026000123',
        trackingCode: 'sp2026000123',
      }),
    ).toBeNull();
  });

  it('never throws on missing cargo data', () => {
    expect(getCustomerTrackingCode({})).toBeNull();
    expect(getCustomerTrackingCode({ trackingCode: null, orderNo: null })).toBeNull();
    expect(getCustomerTrackingCode({ cargoCompanyName: ARAS, trackingCode: '   ' })).toBeNull();
    expect(isCargoTrackingPending({})).toBe(true);
  });

  it('keeps the pending message wording the ticket asks for', () => {
    expect(CARGO_TRACKING_PENDING_MESSAGE).toBe(
      'Kargo firması işlem yaptığında takip numaranız burada görünecektir.',
    );
  });
});

describe('isArasCargoCompany', () => {
  it.each([['Aras Kargo'], ['ARAS KARGO'], ['aras'], [' Aras Kargo ']])('matches %s', (name) => {
    expect(isArasCargoCompany(name)).toBe(true);
  });

  it.each([['Hepsijet'], ['Sürat Kargo'], ['PTT Kargo'], [''], ['   '], [null], [undefined]])(
    'does not match %s',
    (name) => {
      expect(isArasCargoCompany(name as string | null | undefined)).toBe(false);
    },
  );
});
