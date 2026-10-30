import { PaymentRouterResponseDto } from '@/services/checkout.service';
import { GarantiFormData, Iyzico3dsHandoff } from '@/types/checkout.types';
import {
  isGarantiRouterResponse,
  isIyzicoRouterResponse,
  mapGarantiForm,
  mapIyzico3dsHandoff,
} from '../api/checkout.mapper';

export type PaymentRouterHandoff =
  | { kind: 'hosted-3ds'; handoff: Iyzico3dsHandoff }
  | { kind: 'garanti-form'; form: GarantiFormData };

/**
 * Reads the `/payment-router` answer: either a 3DS page the bank already rendered
 * (`threeDSHtmlContent`, sent for Enpara single payments and installment payments)
 * or the Garanti form fields the app posts itself. Errors and unsupported gateways
 * throw a user-facing message.
 */
export function resolvePaymentRouterHandoff(
  response: PaymentRouterResponseDto,
  installmentCount: number,
): PaymentRouterHandoff {
  if (response.status === 'error') {
    throw new Error(response.message ?? 'Ödeme işlemi başlatılamadı.');
  }

  if (isIyzicoRouterResponse(response)) {
    const handoff = mapIyzico3dsHandoff(response);
    if (!handoff) throw new Error(response.message ?? 'İyzico ödeme sayfası açılamadı.');
    return { kind: 'hosted-3ds', handoff };
  }

  if (!isGarantiRouterResponse(response)) {
    throw new Error(
      'Bu ödeme için kart altyapısı şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    );
  }

  return { kind: 'garanti-form', form: mapGarantiForm(response, installmentCount) };
}
