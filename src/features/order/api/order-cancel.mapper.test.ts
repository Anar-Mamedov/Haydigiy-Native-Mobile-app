import { mapCancellationReason, mapCancelPreview, toCancelItemPayload } from './order-cancel.mapper';

describe('mapCancelPreview', () => {
  it('maps preview fields and broken campaigns to the domain model', () => {
    const preview = mapCancelPreview({
      campaign_will_break: true,
      current_total: 500,
      new_total: 350,
      cancelled_amount: 150,
      current_cargo_fee: 0,
      new_cargo_fee: 49.99,
      net_refund_amount: 100.01,
      broken_campaigns: [{ id: 1, name: 'Kargo Bedava', type: 'shipping', min_order_amount: 400 }],
      cancellation_blocked: false,
      block_message: null,
    });

    expect(preview.campaignWillBreak).toBe(true);
    expect(preview.netRefundAmount).toBe(100.01);
    expect(preview.brokenCampaigns).toEqual([
      { id: 1, name: 'Kargo Bedava', type: 'shipping', minOrderAmount: 400 },
    ]);
  });

  it('derives addedCargoFee from cargo fee delta when absent', () => {
    const preview = mapCancelPreview({ current_cargo_fee: 0, new_cargo_fee: 49.99 });
    expect(preview.addedCargoFee).toBeCloseTo(49.99);
  });

  it('defaults missing numeric/flag fields safely', () => {
    const preview = mapCancelPreview({});
    expect(preview.currentTotal).toBe(0);
    expect(preview.cancellationBlocked).toBe(false);
    expect(preview.brokenCampaigns).toEqual([]);
    expect(preview.blockMessage).toBeNull();
  });
});

describe('mapCancellationReason', () => {
  it('maps id and name', () => {
    expect(mapCancellationReason({ id: 3, name: 'Vazgeçtim' })).toEqual({ id: 3, name: 'Vazgeçtim' });
  });
});

describe('toCancelItemPayload', () => {
  it('maps the domain cancel item to the API payload shape', () => {
    expect(
      toCancelItemPayload({ orderItemId: 99, quantity: 1, cancellationReasonId: 5 }),
    ).toEqual({ order_item_id: 99, quantity: 1, cancellation_reason_id: 5 });
  });
});
