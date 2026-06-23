import { PaymentMethodDto } from '@/services/payment.service';
import { PaymentMethod } from '@/types/order.types';

/** Maps a raw payment-method DTO to the domain model used by the IBAN list. */
export function mapPaymentMethod(dto: PaymentMethodDto): PaymentMethod {
  return {
    id: dto.id,
    iban: dto.iban,
    ibanName: dto.iban_name,
    isDefault: Boolean(dto.is_default),
  };
}
