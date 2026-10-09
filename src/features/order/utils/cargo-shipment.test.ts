import { MissingCaseDelivery, OrderDetail } from '@/types/order.types';
import { getMissingDeliveryCargoShipment, getOrderCargoShipment } from './cargo-shipment';

const ORDER = {
  id: 12,
  orderNo: 'HG123',
  trackingCode: 'TRK123',
  cargoCompanyName: 'Hepsijet',
  cargoCompanyLogo: 'https://cdn/hepsijet.png',
  items: [{ id: 1 }, { id: 2 }],
} as unknown as OrderDetail;

function makeDelivery(overrides: Partial<MissingCaseDelivery> = {}): MissingCaseDelivery {
  return {
    orderId: 991,
    orderNo: 'EK-1001',
    status: 'Kargoda',
    cargoCompanyName: 'HEPSIJET',
    trackingCode: 'TRK777',
    itemCount: 1,
    ...overrides,
  };
}

describe('getOrderCargoShipment', () => {
  it('tracks the order itself', () => {
    expect(getOrderCargoShipment(ORDER)).toEqual({
      orderId: '12',
      orderNo: 'HG123',
      trackingCode: 'TRK123',
      cargoCompanyName: 'Hepsijet',
      cargoCompanyLogo: 'https://cdn/hepsijet.png',
      itemCount: 2,
    });
  });
});

describe('getMissingDeliveryCargoShipment', () => {
  it('tracks the compensation shipment by its own order id and reuses the same carrier logo', () => {
    expect(getMissingDeliveryCargoShipment(ORDER, makeDelivery())).toEqual({
      orderId: '991',
      orderNo: 'EK-1001',
      trackingCode: 'TRK777',
      cargoCompanyName: 'HEPSIJET',
      cargoCompanyLogo: 'https://cdn/hepsijet.png',
      itemCount: 1,
    });
  });

  it('matches a Turkish carrier name regardless of letter case', () => {
    const order = { ...ORDER, cargoCompanyName: 'Yurtiçi Kargo' } as OrderDetail;
    const shipment = getMissingDeliveryCargoShipment(
      order,
      makeDelivery({ cargoCompanyName: 'YURTİÇİ KARGO' }),
    );

    expect(shipment.cargoCompanyLogo).toBe('https://cdn/hepsijet.png');
  });

  it('hides the order logo when the shipment uses another carrier', () => {
    const shipment = getMissingDeliveryCargoShipment(
      ORDER,
      makeDelivery({ cargoCompanyName: 'Aras Kargo' }),
    );

    expect(shipment.cargoCompanyName).toBe('Aras Kargo');
    expect(shipment.cargoCompanyLogo).toBeNull();
  });

  it('falls back to the order carrier when the shipment has none', () => {
    const shipment = getMissingDeliveryCargoShipment(
      ORDER,
      makeDelivery({ cargoCompanyName: null, orderNo: '' }),
    );

    expect(shipment).toMatchObject({
      cargoCompanyName: 'Hepsijet',
      cargoCompanyLogo: 'https://cdn/hepsijet.png',
      orderNo: null,
    });
  });
});
