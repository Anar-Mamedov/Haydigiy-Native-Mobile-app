import { ReturnRejectionDto, ReturnRejectionImageDto } from './order-detail.dtos';
import { ReturnRejection, ReturnRejectionImage } from '@/types/order.types';
import { formatTurkeyDateTime } from '@/utils/format-turkey-date-time';
import { resolveCdnUrl } from '@/utils/cdn';

function toText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

/** Drops photos without a usable url so the gallery never renders a broken tile. */
function mapImages(dtos: ReturnRejectionImageDto[] | null | undefined): ReturnRejectionImage[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.flatMap((dto, index) => {
    const url = resolveCdnUrl(dto?.url);
    if (!url) return [];
    return [
      {
        key: dto.id != null ? String(dto.id) : `${url}-${index}`,
        url,
        description: toText(dto.description),
        capturedAt: formatTurkeyDateTime(dto.captured_at),
      },
    ];
  });
}

/** Maps the `rejection` block of a returned line; null when the line was not rejected. */
export function mapReturnRejection(dto: ReturnRejectionDto | null | undefined): ReturnRejection | null {
  if (!dto || typeof dto !== 'object') return null;
  return {
    caseNo: toText(dto.case_no),
    statusText: toText(dto.status_text),
    description: toText(dto.description),
    images: mapImages(dto.images),
    cargoCompany: toText(dto.cargo_company),
    trackingCode: toText(dto.tracking_code),
    shipmentOrderNo: toText(dto.shipment_order_no),
    shipmentStatusText: toText(dto.shipment_status_text),
  };
}
