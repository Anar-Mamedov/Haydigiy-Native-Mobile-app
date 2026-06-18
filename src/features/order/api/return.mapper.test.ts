import { mapReturnReason, toReturnItemPayload } from './return.mapper';

describe('mapReturnReason', () => {
  it('maps id and name', () => {
    expect(mapReturnReason({ id: 7, name: 'Beden büyük geldi' })).toEqual({
      id: 7,
      name: 'Beden büyük geldi',
    });
  });
});

describe('toReturnItemPayload', () => {
  it('maps the domain return item to the API payload shape (without the photo)', () => {
    expect(
      toReturnItemPayload({ orderItemId: 42, quantity: 1, returnReasonId: 3, photo: null }),
    ).toEqual({ order_item_id: 42, quantity: 1, return_reason_id: 3 });
  });
});
