import {
  isStorePickupCargo,
  STORE_PICKUP_ADDRESS,
  STORE_PICKUP_CARGO_ID,
  STORE_PICKUP_MAP_URL,
} from './store-pickup-location';

describe('isStorePickupCargo', () => {
  // Ödemedeki kargo listesinde id var; panelden ad değişse de id yeter.
  it('recognizes the checkout option by id', () => {
    expect(STORE_PICKUP_CARGO_ID).toBe(5);
    expect(isStorePickupCargo({ id: 5, name: 'Mağazadan Al' })).toBe(true);
    expect(isStorePickupCargo({ id: 5, name: 'Mağazadan Teslim' })).toBe(true);
    expect(isStorePickupCargo({ id: 8, name: 'Aras Kargo' })).toBe(false);
  });

  // Sipariş detayı kargo firmasının id'sini döndürmüyor; ad ile tanınır.
  it('recognizes an order by the carrier name, case and spacing aside', () => {
    expect(isStorePickupCargo({ name: 'Mağazadan Al' })).toBe(true);
    expect(isStorePickupCargo({ name: '  MAĞAZADAN AL ' })).toBe(true);
    expect(isStorePickupCargo({ name: 'mağazadan al' })).toBe(true);
    expect(isStorePickupCargo({ name: 'PTT Kargo' })).toBe(false);
    expect(isStorePickupCargo({ name: null })).toBe(false);
    expect(isStorePickupCargo({})).toBe(false);
  });

  it('keeps the address and map link the web uses', () => {
    expect(STORE_PICKUP_ADDRESS).toBe('Selçuk Mah. Gemili Park Karşısı Haydigiy Mağaza');
    expect(STORE_PICKUP_MAP_URL).toBe('https://maps.app.goo.gl/9FFKFdVv4tTwyjZKA');
  });
});
