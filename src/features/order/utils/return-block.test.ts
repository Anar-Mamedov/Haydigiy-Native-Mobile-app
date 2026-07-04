import { getReturnBlockBannerMessage } from './return-block';

function makeOrder(overrides: Partial<Parameters<typeof getReturnBlockBannerMessage>[0]> = {}) {
  return {
    canCreateReturnRequest: false,
    returnBlockReason: 'already_requested',
    statusId: 3,
    ...overrides,
  };
}

// Web sipariş detayı paritesi: yalnızca time_expired ve already_requested
// gösterilir; not_delivered ve bilinmeyen nedenler ile taslak durumlar gizlenir.
describe('getReturnBlockBannerMessage', () => {
  it('shows the informational text after a return was created', () => {
    expect(getReturnBlockBannerMessage(makeOrder(), false)).toBe(
      'Bu sipariş için iade talebi oluşturuldu',
    );
  });

  it('shows the expiry text when the 14-day window passed', () => {
    expect(
      getReturnBlockBannerMessage(makeOrder({ returnBlockReason: 'time_expired' }), false),
    ).toBe('İade süresi doldu (14 gün)');
  });

  it('hides the banner for not-delivered orders like the web', () => {
    expect(
      getReturnBlockBannerMessage(makeOrder({ returnBlockReason: 'not_delivered' }), false),
    ).toBeNull();
  });

  it('hides the banner for unknown reasons', () => {
    expect(
      getReturnBlockBannerMessage(makeOrder({ returnBlockReason: 'some_new_reason' }), false),
    ).toBeNull();
  });

  it('hides the banner on unpaid draft statuses (1 and 14)', () => {
    expect(getReturnBlockBannerMessage(makeOrder({ statusId: 14 }), false)).toBeNull();
    expect(getReturnBlockBannerMessage(makeOrder({ statusId: 1 }), false)).toBeNull();
  });

  it('hides the banner when the order is cancellable or returnable', () => {
    expect(getReturnBlockBannerMessage(makeOrder(), true)).toBeNull();
    expect(
      getReturnBlockBannerMessage(makeOrder({ canCreateReturnRequest: true }), false),
    ).toBeNull();
  });
});
