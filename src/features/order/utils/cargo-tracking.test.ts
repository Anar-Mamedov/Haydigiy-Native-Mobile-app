import {
  CARGO_TRACKING_PENDING_MESSAGE,
  getCustomerTrackingCode,
  isCargoTrackingPending,
} from './cargo-tracking';

describe('getCustomerTrackingCode', () => {
  it('hides the internal HG placeholder the backend writes before the carrier responds', () => {
    // Real record from the ticket: the tracking field holds the order's own number.
    expect(getCustomerTrackingCode('HG0608261190940', 'HG0608261190940')).toBeNull();
    expect(isCargoTrackingPending('HG0608261190940', 'HG0608261190940')).toBe(true);

    // The HG shape alone is enough, even without the order number at hand.
    expect(getCustomerTrackingCode('HG0608261190940')).toBeNull();
    expect(getCustomerTrackingCode('hg0608261190940')).toBeNull();
  });

  it('shows a real tracking number issued by the carrier', () => {
    expect(getCustomerTrackingCode('6475494566146', 'HG0608261190940')).toBe('6475494566146');
    expect(isCargoTrackingPending('6475494566146', 'HG0608261190940')).toBe(false);
    // Carriers that issue alphanumeric codes must not be filtered out.
    expect(getCustomerTrackingCode('AR1234567890TR', 'HG0608261190940')).toBe('AR1234567890TR');
    expect(getCustomerTrackingCode('  6475494566146  ', 'HG0608261190940')).toBe('6475494566146');
  });

  it('hides a tracking code that is a copy of the order number', () => {
    // Keeps working if the order-number prefix ever changes.
    expect(getCustomerTrackingCode('SP2026000123', 'SP2026000123')).toBeNull();
    expect(getCustomerTrackingCode('sp2026000123', 'SP2026000123')).toBeNull();
  });

  it('never throws on missing cargo data', () => {
    expect(getCustomerTrackingCode(null, null)).toBeNull();
    expect(getCustomerTrackingCode(undefined, undefined)).toBeNull();
    expect(getCustomerTrackingCode('', 'HG0608261190940')).toBeNull();
    expect(getCustomerTrackingCode('   ', 'HG0608261190940')).toBeNull();
    expect(isCargoTrackingPending(undefined, undefined)).toBe(true);
  });

  it('keeps the pending message wording the ticket asks for', () => {
    expect(CARGO_TRACKING_PENDING_MESSAGE).toBe(
      'Kargo firması işlem yaptığında takip numaranız burada görünecektir.',
    );
  });
});
