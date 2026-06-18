import { ReturnItemPayloadDto, ReturnReasonDto } from './return.dtos';
import { PaymentMethodDto } from '@/services/payment.service';
import { AddressDto } from '@/services/address.service';
import { PaymentMethod, ReturnReason, ReturnSubmitItem, SavedAddress } from '@/types/order.types';

/** Maps a raw return-reason DTO to the domain model used by the UI. */
export function mapReturnReason(dto: ReturnReasonDto): ReturnReason {
  return { id: dto.id, name: dto.name };
}

/** Maps a domain return item to the API field shape (sans the file part). */
export function toReturnItemPayload(item: ReturnSubmitItem): ReturnItemPayloadDto {
  return {
    order_item_id: item.orderItemId,
    quantity: item.quantity,
    return_reason_id: item.returnReasonId,
  };
}

/** Maps a saved-IBAN DTO to the domain payment method used by the IBAN selector. */
export function mapPaymentMethod(dto: PaymentMethodDto): PaymentMethod {
  return {
    id: dto.id,
    iban: dto.iban,
    ibanName: dto.iban_name,
    isDefault: Boolean(dto.is_default),
  };
}

/** Maps a saved-address DTO to the domain shape used by the pickup picker. */
export function mapSavedAddress(dto: AddressDto): SavedAddress {
  const city = dto.city?.name || dto.city_name || '';
  const district = dto.district?.name || dto.district_name || '';
  const neighbourhood = dto.neighbourhood?.name || dto.neighbourhood_name || '';
  const fullName = `${dto.name ?? ''} ${dto.surname ?? ''}`.trim();
  return {
    id: String(dto.id),
    title: dto.title?.trim() || fullName,
    name: dto.name ?? '',
    surname: dto.surname ?? '',
    phone: dto.phone ?? '',
    addressLine: dto.address_line ?? '',
    city,
    district,
    neighbourhood,
  };
}
