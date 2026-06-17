export type ShippingDeliveryWarning = {
  show: boolean;
  type: 'deadline' | 'holiday_period';
  title?: string;
  message: string;
  estimatedDeliveryDayHuman?: string;
};

export type ShippingEstimate = {
  timeLeft: string;
  dispatchDayHuman: string;
  /** Dispatch ("kargoya teslim") sentence shown at the top of the card. */
  message: string;
  avgDeliveryDays?: number;
  estimatedDeliveryDayHuman?: string;
  deliveryWarning?: ShippingDeliveryWarning | null;
};
