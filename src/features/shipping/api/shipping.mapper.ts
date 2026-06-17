import { ShippingEstimateDto } from './shipping.dtos';
import { ShippingEstimate } from '@/types/shipping.types';

export function mapShippingEstimateDto(dto: ShippingEstimateDto): ShippingEstimate {
  const warning = dto.delivery_warning;
  return {
    timeLeft: dto.time_left,
    dispatchDayHuman: dto.dispatch_day_human,
    message: dto.message,
    avgDeliveryDays: dto.avg_delivery_days,
    estimatedDeliveryDayHuman: dto.estimated_delivery_day_human,
    deliveryWarning: warning
      ? {
          show: warning.show,
          type: warning.type,
          title: warning.title,
          message: warning.message,
          estimatedDeliveryDayHuman: warning.estimated_delivery_day_human,
        }
      : null,
  };
}
