import { CargoShipment, MissingCaseDelivery, OrderDetail } from '@/types/order.types';

/**
 * Carrier names arrive in any case ("HEPSIJET", "Hepsijet", "YURTİÇİ"). I/İ/ı are folded
 * to `i` first: neither the Turkish nor the default lowercase handles both spellings.
 */
function normalizeCompanyName(name: string | null): string {
  return (name ?? '').trim().replace(/[İIı]/g, 'i').toLowerCase();
}

function isSameCompany(a: string | null, b: string | null): boolean {
  return normalizeCompanyName(a) === normalizeCompanyName(b);
}

/** The order's own shipment, tracked from the order summary. */
export function getOrderCargoShipment(order: OrderDetail): CargoShipment {
  return {
    orderId: String(order.id),
    orderNo: order.orderNo,
    trackingCode: order.trackingCode,
    cargoCompanyName: order.cargoCompanyName,
    cargoCompanyLogo: order.cargoCompanyLogo,
    itemCount: order.items.length,
  };
}

/**
 * A missing-item compensation shipment. It is tracked by its own order id; the
 * carrier falls back to the order's, and the order's logo is only reused when the
 * carrier is the same so a different carrier never shows the wrong logo.
 */
export function getMissingDeliveryCargoShipment(
  order: OrderDetail,
  delivery: MissingCaseDelivery,
): CargoShipment {
  const cargoCompanyName = delivery.cargoCompanyName ?? order.cargoCompanyName;

  return {
    orderId: String(delivery.orderId),
    orderNo: delivery.orderNo || null,
    trackingCode: delivery.trackingCode,
    cargoCompanyName,
    cargoCompanyLogo: isSameCompany(cargoCompanyName, order.cargoCompanyName)
      ? order.cargoCompanyLogo
      : null,
    itemCount: delivery.itemCount,
  };
}
